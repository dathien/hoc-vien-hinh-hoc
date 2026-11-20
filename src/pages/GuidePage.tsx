import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Box,
  ChevronRight,
  Compass,
  Download,
  FilePlus2,
  FolderOpen,
  GraduationCap,
  HardDrive,
  HelpCircle,
  Lightbulb,
  MapPin,
  Maximize2,
  PenTool,
  Play,
  Ruler,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  WifiOff,
} from 'lucide-react';
import { ALL_CHALLENGES, LEVELS } from '../challenges';
import { LiveGeo3DPreview } from '../components/geometry3d/LiveGeo3DPreview';
import { BADGE_DEFINITIONS } from '../data/ranksAndBadges';
import { TEMPLATES_2D } from '../geometry/templates2d';
import { ALL_CHALLENGES_3D, LEVELS_3D } from '../geometry3d/challenges3d';
import { getTemplate3DById, TEMPLATES_3D } from '../geometry3d/templates3d';
import { useApp } from '../store/AppContext';

interface QuickTaskGuide {
  id: string;
  number: number;
  title: string;
  purpose: string;
  location: string;
  steps: string[];
  actionLabel: string;
  actionTarget: 'lab' | 'campaign' | 'settings';
  labMode?: '2d' | '3d' | 'templates' | 'saved';
  campaignDim?: '2d' | '3d';
}

const QUICK_TASK_GUIDES: QuickTaskGuide[] = [
  {
    id: 'task-new-drawing',
    number: 1,
    title: 'Tạo bản vẽ mới',
    purpose: 'Khởi tạo bảng vẽ trắng sạch để tự dựng hình phẳng 2D hoặc không gian 3D mà không bị lẫn hình mẫu cũ.',
    location: 'Thanh trên cùng của Phòng thực hành → nút "Bản vẽ mới".',
    steps: [
      'Mở mục "Phòng thực hành" trên thanh điều hướng và chọn chế độ "Dựng hình 2D" hoặc "Dựng hình 3D".',
      'Nhấn nút "Bản vẽ mới" ở thanh công cụ phía trên.',
      'Nếu bản vẽ hiện tại có thay đổi chưa lưu, chọn Lưu lại hoặc Xác nhận tạo mới ngay trên hộp thoại.',
      'Nhấp trực tiếp vào tiêu đề bản vẽ ở góc trên trái để đặt tên mới cho bài vẽ.',
    ],
    actionLabel: 'Mở Phòng thực hành',
    actionTarget: 'lab',
    labMode: '2d',
  },
  {
    id: 'task-tools-2d',
    number: 2,
    title: 'Sử dụng công cụ 2D',
    purpose: 'Dựng điểm, đường thẳng, đường tròn, trung điểm, đường vuông góc, phép biến hình và đo đạc trên mặt phẳng.',
    location: 'Thanh công cụ dọc bên trái gồm 4 nút dùng nhanh và 8 nhóm công cụ.',
    steps: [
      'Chọn nhanh 4 công cụ thường dùng (Chọn, Điểm, Đoạn thẳng, Đường tròn) ngay đầu thanh bên trái.',
      'Hoặc nhấp vào 1 trong 8 nhóm công cụ để mở bảng chọn bên cạnh; bảng tự đóng ngay khi bạn chọn công cụ.',
      'Theo dõi dòng nhắc 1 dòng ngay phía trên bảng vẽ để biết cần nhấp vào đối tượng nào tiếp theo.',
      'Dùng phím Esc để quay về công cụ Chọn, Ctrl+Z để hoàn tác và Delete để xóa đối tượng đang chọn.',
    ],
    actionLabel: 'Thực hành 2D ngay',
    actionTarget: 'lab',
    labMode: '2d',
  },
  {
    id: 'task-tools-3d',
    number: 3,
    title: 'Sử dụng công cụ 3D',
    purpose: 'Tạo các hình khối không gian chuẩn SGK Toán 11–12, dựng mặt phẳng, thiết diện, hệ trục Oxyz và đo góc nhị diện.',
    location: 'Phòng thực hành → thẻ "Dựng hình 3D" → thanh công cụ dọc bên trái.',
    steps: [
      'Chọn Mặt phẳng làm việc (Oxy, Oxz hoặc Oyz) ngay đầu thanh công cụ bên trái trước khi chấm điểm tự do.',
      'Mở nhóm "Hình khối 3D" để chèn nhanh hình lập phương, hình chóp, lăng trụ, hình cầu, hình trụ hoặc hình nón.',
      'Mở các nhóm Quan hệ, Thiết diện, Hệ Oxyz hoặc Đo đạc để dựng đường vuông góc, mặt cắt và đo góc/khoảng cách.',
      'Kéo chuột trái để xoay 360°, cuộn để thu phóng và chọn góc nhìn chuẩn (Trước, Trên, Phối cảnh) ở thanh dưới.',
    ],
    actionLabel: 'Thực hành 3D ngay',
    actionTarget: 'lab',
    labMode: '3d',
  },
  {
    id: 'task-edit-object',
    number: 4,
    title: 'Chỉnh sửa đối tượng',
    purpose: 'Đổi tên nhãn, màu sắc, kiểu nét liền/nét đứt, độ dày nét, ẩn/hiện hoặc điều chỉnh kích thước hình khối.',
    location: 'Bảng Danh sách đối tượng & Thuộc tính bên phải bảng vẽ (có thể thu gọn hoặc kéo đổi độ rộng).',
    steps: [
      'Chọn công cụ "Chọn" rồi nhấp trực tiếp vào đối tượng trên bảng vẽ hoặc trong Danh sách đối tượng bên phải.',
      'Thay đổi nhãn hiển thị, màu nét, kiểu nét (nét liền / nét đứt) hoặc kích thước điểm/nét.',
      'Với hình khối 3D, kéo thanh trượt cạnh, chiều cao, bán kính để hình khối và thể tích cập nhật tức thì.',
      'Kéo viền mép trái của bảng thuộc tính để điều chỉnh độ rộng phù hợp màn hình trình chiếu.',
    ],
    actionLabel: 'Thử chỉnh thuộc tính',
    actionTarget: 'lab',
    labMode: '2d',
  },
  {
    id: 'task-open-template',
    number: 5,
    title: 'Mở hình mẫu',
    purpose: `Mở nhanh ${TEMPLATES_2D.length} hình mẫu 2D (Toán 10 & mở rộng) và ${TEMPLATES_3D.length} hình mẫu 3D (Toán 11 – Toán 12) để dạy và học.`,
    location: 'Phòng thực hành → nút "Mở mẫu" trên thanh trên cùng hoặc thẻ "Thư viện hình mẫu".',
    steps: [
      'Nhấn nút "Mở mẫu" trên thanh trên cùng hoặc chuyển sang thẻ "Thư viện hình mẫu".',
      'Lọc theo Khối lớp (Tất cả / Toán 10 / Toán 11 / Toán 12), không gian (2D / 3D) hoặc nhập từ khóa tìm kiếm.',
      'Nhấp vào thẻ hình mẫu để mở trực tiếp trong không gian dựng hình tương ứng.',
      'Kéo các điểm tự do trên hình mẫu để quan sát các quan hệ hình học thay đổi động.',
    ],
    actionLabel: 'Mở Thư viện hình mẫu',
    actionTarget: 'lab',
    labMode: 'templates',
  },
  {
    id: 'task-save-drawing',
    number: 6,
    title: 'Lưu bản vẽ',
    purpose: 'Lưu trữ bản vẽ 2D và 3D theo khối lớp THPT ngay trên thiết bị, kèm ảnh thu nhỏ, tìm kiếm, nhân bản và xuất ảnh PNG/SVG.',
    location: 'Thanh trên cùng Phòng thực hành → nút "Lưu bản vẽ" (phím tắt Ctrl+S) và thẻ "Bản vẽ của tôi".',
    steps: [
      'Đặt tên bản vẽ rõ ràng và chọn khối lớp THPT (Toán 10, Toán 11, Toán 12) ở góc trên trái.',
      'Nhấn nút "Lưu bản vẽ" (hoặc tổ hợp phím Ctrl+S) để lưu vào bộ nhớ thiết bị.',
      'Mở thẻ "Bản vẽ của tôi" để xem lại toàn bộ bản vẽ 2D và 3D đã lưu, lọc theo lớp, đổi tên hoặc nhân bản.',
      'Nhấn "Xuất PNG" hoặc "Xuất SVG" khi cần chèn hình vẽ sắc nét vào bài giảng, phiếu học tập hoặc đề thi.',
    ],
    actionLabel: 'Xem Bản vẽ của tôi',
    actionTarget: 'lab',
    labMode: 'saved',
  },
  {
    id: 'task-challenges',
    number: 7,
    title: 'Thực hiện thử thách',
    purpose: `Rèn luyện kỹ năng dựng hình qua ${ALL_CHALLENGES.length} thử thách 2D (${LEVELS.length} cấp) và ${ALL_CHALLENGES_3D.length} thử thách 3D (${LEVELS_3D.length} cấp) cho THPT 10–11–12.`,
    location: 'Thanh điều hướng trên cùng → mục "Thử thách" → chọn khối lớp Toán 10, Toán 11 hoặc Toán 12.',
    steps: [
      'Vào mục "Thử thách", chọn bộ lọc lớp (Tất cả / Toán 10 / Toán 11 / Toán 12) và chọn cấp độ muốn luyện.',
      'Đọc kỹ đề bài, giả thiết và sử dụng các công cụ được cung cấp để dựng đối tượng theo yêu cầu.',
      'Nhấn "Kiểm chứng" để hệ thống kiểm tra tính chính xác hình học động và chấm điểm 3 sao.',
      'Mức sao: 3 sao (đúng không cần gợi ý), 2 sao (đúng có dùng gợi ý), 1 sao (đúng sau khi xem lời giải).',
    ],
    actionLabel: 'Mở Thử thách THPT',
    actionTarget: 'campaign',
    campaignDim: '3d',
  },
  {
    id: 'task-fullscreen',
    number: 8,
    title: 'Trình chiếu toàn màn hình',
    purpose: 'Mở rộng tối đa bảng vẽ để giảng dạy trên máy chiếu, bảng tương tác hoặc màn hình lớn trong lớp học.',
    location: 'Thanh trên cùng của Phòng thực hành hoặc màn hình Thử thách → nút "Toàn màn hình" / "Trình chiếu".',
    steps: [
      'Mở bản vẽ hoặc bài thử thách cần giảng dạy trên lớp.',
      'Nhấn nút "Toàn màn hình" (hoặc "Trình chiếu" trong 3D) để ẩn thanh phụ và mở rộng khung vẽ tối đa.',
      'Bật chế độ cỡ chữ lớn trong Cài đặt nếu lớp học rộng cần nhìn rõ nhãn điểm từ xa.',
      'Nhấn phím Esc hoặc nút "Thoát toàn màn hình" bất cứ lúc nào để quay lại giao diện đầy đủ.',
    ],
    actionLabel: 'Thử chế độ Toàn màn hình',
    actionTarget: 'lab',
    labMode: '3d',
  },
  {
    id: 'task-offline',
    number: 9,
    title: 'Cài đặt offline',
    purpose: 'Sử dụng toàn bộ ứng dụng không cần đăng nhập và không cần kết nối mạng, kèm sao lưu dữ liệu an toàn.',
    location: 'Thanh điều hướng → "Mở rộng" → "Cài đặt & Sao lưu" hoặc biểu tượng cài đặt PWA trên trình duyệt.',
    steps: [
      'Mở ứng dụng trên Chrome, Edge hoặc Safari và nhấn biểu tượng "Cài đặt ứng dụng" trên thanh địa chỉ.',
      'Sau khi cài, mở Học Viện Hình Học Smart ngay từ màn hình chính kể cả khi ngắt mạng Internet.',
      'Vào "Mở rộng → Cài đặt & Sao lưu" và chọn "Xuất tệp sao lưu" định kỳ để lưu trữ thành tích và bản vẽ.',
      'Khi chuyển sang máy mới, chọn "Nhập & Khôi phục" để khôi phục toàn bộ tiến độ và bản vẽ của bạn.',
    ],
    actionLabel: 'Mở Cài đặt & Sao lưu',
    actionTarget: 'settings',
  },
];

interface Guide3DGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  steps: string[];
  tip: string;
  templateId: string;
}

const GUIDE_3D_GROUPS: Guide3DGroup[] = [
  {
    id: 'guide3d-1',
    number: 1,
    title: 'Làm quen không gian 3D và góc nhìn',
    summary:
      'Xoay quan sát mô hình 360°, phóng to thu nhỏ và chuyển đổi nhanh giữa 4 chế độ hiển thị trực quan.',
    steps: [
      'Kéo chuột trái trên vùng 3D để xoay góc nhìn tự do, cuộn con lăn để thu phóng và kéo chuột phải để dịch chuyển khung nhìn.',
      'Chọn nhanh 6 góc nhìn chuẩn ở thanh dưới: Trước, Sau, Trái, Phải, Trên và Phối cảnh; nhấn Căn giữa để đưa hình về trung tâm.',
      'Chuyển giữa 4 chế độ: Hình học SGK (nét liền/nét khuất chuẩn sách giáo khoa), Hình khối 3D, Khung dây và Hệ tọa độ Oxyz.',
    ],
    tip: 'Bật nút "Tự xoay" để quan sát khối đa diện từ mọi hướng; hệ thống sẽ tự tạm dừng khi bạn chọn công cụ dựng hình.',
    templateId: 'T3D_01',
  },
  {
    id: 'guide3d-2',
    number: 2,
    title: 'Tạo hình khối và chỉnh kích thước',
    summary:
      'Chọn hình khối không gian chuẩn SGK Toán 11–12 và thay đổi cạnh, chiều cao, bán kính theo thời gian thực.',
    steps: [
      'Mở nhóm "Hình khối 3D" ở thanh công cụ bên trái và nhấn "Thư viện hình khối 3D".',
      'Chọn khối cần tạo (hình chóp, lăng trụ, lập phương, hình cầu, hình trụ, hình nón...) và nhập kích thước ban đầu.',
      'Nhấp chọn hình khối để mở bảng Thuộc tính bên phải: kéo thanh trượt thay đổi a, b, h, r và bật/tắt mặt, cạnh, đỉnh, đường cao hoặc đường chéo.',
    ],
    tip: 'Thể tích V và diện tích toàn phần được hệ thống tính toán tự động, chính xác theo đúng đỉnh thực của hình khối.',
    templateId: 'T3D_05',
  },
  {
    id: 'guide3d-3',
    number: 3,
    title: 'Dựng điểm, đường thẳng, mặt phẳng 3D',
    summary:
      'Chọn mặt phẳng làm việc rõ ràng trước khi đặt điểm tự do và sử dụng các công cụ quan hệ song song – vuông góc.',
    steps: [
      'Chọn Mặt phẳng làm việc (Oxy, Oxz hoặc Oyz) và kéo thanh Cao độ/dịch ở góc trên bên trái trước khi dùng công cụ "Điểm tự do 3D".',
      'Dùng các công cụ Đoạn thẳng, Đường thẳng, Trung điểm, Mặt phẳng qua 3 điểm bằng cách nhấp lần lượt các đối tượng theo dòng nhắc trực tiếp.',
      'Sử dụng nhóm "Quan hệ hình học" để dựng đường thẳng song song, đường thẳng vuông góc với mặt phẳng, giao tuyến hoặc chân đường vuông góc.',
    ],
    tip: 'Khi kéo điểm tự do trong chế độ Chọn, mọi trung điểm, mặt phẳng, đường thẳng và thiết diện phụ thuộc sẽ tự động cập nhật theo.',
    templateId: 'T3D_16',
  },
  {
    id: 'guide3d-4',
    number: 4,
    title: 'Dựng thiết diện và kéo mặt phẳng cắt',
    summary:
      'Tạo thiết diện động giữa mặt phẳng và hình khối, quan sát hình chiếu phẳng 2D của thiết diện cùng chu vi và diện tích.',
    steps: [
      'Tạo một hình khối (ví dụ hình lập phương hoặc hình chóp) và một mặt phẳng cắt (qua 3 điểm hoặc theo phương trình).',
      'Chọn công cụ "Thiết diện khối – mặt phẳng", sau đó nhấp vào hình khối rồi nhấp vào mặt phẳng cắt.',
      'Chọn mặt phẳng cắt và kéo thanh trượt tịnh tiến (hoặc kéo một điểm xác định mặt phẳng) để xem hình dạng thiết diện biến đổi liên tục.',
    ],
    tip: 'Nhấp chọn đối tượng Thiết diện để xem hình 2D phẳng của thiết diện và nút "Ẩn hình khối để xem riêng thiết diện".',
    templateId: 'T3D_21',
  },
  {
    id: 'guide3d-5',
    number: 5,
    title: 'Hệ tọa độ Oxyz và nhập phương trình',
    summary:
      'Hỗ trợ đầy đủ Hình học tọa độ không gian Toán 12: nhập điểm (x;y;z), vectơ, phương trình mặt phẳng và mặt cầu.',
    steps: [
      'Chuyển sang chế độ hiển thị "Hệ tọa độ" để hiện rõ ba trục Ox (đỏ), Oy (xanh lá), Oz (xanh dương) cùng các mặt phẳng tọa độ.',
      'Mở nhóm "Hệ tọa độ Oxyz" để nhập Điểm theo tọa độ (x; y; z), Vectơ, Đường thẳng qua điểm & VTCP, Mặt phẳng Ax+By+Cz+D=0 hoặc Mặt cầu.',
      'Dùng thẻ "Quan hệ" ở bảng bên phải để phân tích ngay vị trí tương đối (song song, cắt nhau, chéo nhau, vuông góc), góc và khoảng cách.',
    ],
    tip: 'Trong chế độ Hệ tọa độ, tọa độ của từng điểm được hiển thị rõ ngay cạnh tên điểm trên không gian 3D.',
    templateId: 'T3D_35',
  },
  {
    id: 'guide3d-6',
    number: 6,
    title: 'Đo đạc, trình chiếu và xuất hình',
    summary:
      'Đo góc nhị diện, khoảng cách giữa hai đường thẳng chéo nhau, bật Chế độ trình chiếu lớp học và xuất SVG vector / PNG.',
    steps: [
      'Dùng nhóm "Đo đạc không gian" để đo độ dài, góc giữa đường thẳng và mặt phẳng, góc nhị diện [0°–180°] và khoảng cách trong không gian.',
      'Nhấn nút "Trình chiếu" trên thanh trên cùng để mở rộng tối đa khung 3D, phóng to nhãn chữ và nhấn mạnh từng bước dựng khi dạy trên lớp.',
      'Mở nút "Xuất" để tải ảnh PNG nền trắng, PNG nền trong suốt, tệp SVG vector chuẩn (không nhúng ảnh bitmap) hoặc tệp JSON để chia sẻ.',
    ],
    tip: 'Bạn có thể kéo trực tiếp từng nhãn điểm trên màn hình 3D để sắp xếp đẹp mắt trước khi xuất hình SVG hoặc PNG chèn vào đề thi.',
    templateId: 'T3D_29',
  },
];

type GuideIllustrationId =
  | 'interface'
  | 'straightedge'
  | 'compass'
  | 'points'
  | 'first-challenge'
  | 'verify'
  | 'hints'
  | 'lab'
  | 'classroom'
  | 'achievements'
  | 'export'
  | 'backup';

interface GuideGroup {
  id: string;
  number: number;
  title: string;
  summary: string;
  steps: string[];
  tip: string;
  illustration: GuideIllustrationId;
  actionLabel: string;
  actionType: 'page' | 'challenge' | 'tour';
  actionTarget: string;
}

const GUIDE_GROUPS: GuideGroup[] = [
  {
    id: 'guide-1',
    number: 1,
    title: 'Làm quen với giao diện',
    summary:
      'Thanh điều hướng phía trên giúp bạn di chuyển nhanh giữa các khu vực học tập chính mà không cần đăng nhập.',
    steps: [
      'Trang chủ: xem tổng quan lộ trình Toán 10 – 11 – 12, tiến độ học tập và mở nhanh bài thử thách tiếp theo.',
      `Thử thách: hệ thống ${LEVELS.length} cấp độ 2D (${ALL_CHALLENGES.length} bài) và ${LEVELS_3D.length} cấp độ 3D (${ALL_CHALLENGES_3D.length} bài) sắp xếp theo lộ trình.`,
      'Phòng thực hành: bảng vẽ hình học tự do 2D & 3D có đầy đủ công cụ để tự vẽ, đo đạc và khám phá.',
      'Theo lớp · Đấu trường · Thư viện · Mở rộng: học theo khối lớp 10–11–12, tổ chức thi đua, tra cứu SGK và mở tiện ích giáo viên.',
    ],
    tip: 'Nếu cần xem lại nhanh các khu vực chính ngay trên màn hình, bạn có thể nhấn nút "Mở hướng dẫn tương tác" ở đầu trang.',
    illustration: 'interface',
    actionLabel: 'Về Trang chủ',
    actionType: 'page',
    actionTarget: 'home',
  },
  {
    id: 'guide-2',
    number: 2,
    title: 'Sử dụng thước thẳng',
    summary:
      'Thước thẳng không chia độ dùng để nối hai điểm đã biết thành đoạn thẳng, đường thẳng kéo dài hoặc tia.',
    steps: [
      'Chọn một trong ba công cụ: Đoạn thẳng, Đường thẳng hoặc Tia trên thanh công cụ dựng hình.',
      'Nhấp chọn điểm thứ nhất làm điểm đi qua (vòng sáng bắt dính sẽ hiện lên khi con trỏ chạm đúng điểm).',
      'Di chuyển con trỏ đến điểm thứ hai rồi nhấp chuột để hoàn tất đường nối.',
      'Bạn có thể bật chế độ "Thước & Compa ảo" ngay trên thanh công cụ để quan sát thước thẳng đặt trực tiếp lên hai điểm.',
    ],
    tip: 'Đường thẳng kéo dài vô hạn hai phía rất hữu ích để tìm giao điểm với các đường tròn hoặc đường thẳng khác.',
    illustration: 'straightedge',
    actionLabel: 'Thực hành với thước thẳng',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-3',
    number: 3,
    title: 'Sử dụng compa',
    summary:
      'Compa dùng để vẽ đường tròn biết tâm và một điểm trên đường tròn, hoặc sao chép độ dài một đoạn thẳng sang vị trí khác.',
    steps: [
      'Chọn công cụ "Đường tròn" trên thanh công cụ cơ bản.',
      'Nhấp vào điểm làm tâm đường tròn trước, sau đó di chuyển chuột ra ngoài để mở độ rộng compa.',
      'Nhấp vào một điểm sẵn có (hoặc điểm mới) để xác định bán kính của đường tròn.',
      'Khi cần giữ nguyên bán kính của một đoạn thẳng có sẵn, chọn công cụ "Sao chép độ dài": chọn hai đầu mút đoạn mẫu rồi chọn điểm tâm mới.',
    ],
    tip: 'Dùng hai đường tròn có cùng bán kính đặt tâm tại hai đầu mút A và B là bước khởi đầu quen thuộc để dựng tam giác đều và đường trung trực.',
    illustration: 'compass',
    actionLabel: 'Thực hành vẽ đường tròn',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-4',
    number: 4,
    title: 'Tạo điểm và giao điểm',
    summary:
      'Điểm là đối tượng cơ sở của mọi phép dựng. Đặt giao điểm chính xác giúp hình giữ nguyên tính chất khi kéo thả.',
    steps: [
      'Chọn công cụ "Tạo điểm" để chấm điểm tự do trên mặt phẳng hoặc chọn "Điểm trên đối tượng" để gắn điểm chạy dọc theo một đường thẳng hay đường tròn.',
      'Chọn công cụ "Tạo giao điểm" để xác định giao điểm giữa hai đường thẳng, giữa đường thẳng và đường tròn, hoặc giữa hai đường tròn.',
      'Nhấp vào đối tượng thứ nhất rồi nhấp vào đối tượng thứ hai (hoặc nhấp trực tiếp ngay tại chỗ hai nét cắt nhau khi thấy vòng sáng bắt dính).',
      'Chuyển sang công cụ "Chọn và di chuyển" để kéo thử các điểm tự do và quan sát các giao điểm tự động chạy theo.',
    ],
    tip: 'Luôn dùng công cụ "Tạo giao điểm" hoặc nhấp đúng lúc vòng bắt dính sáng lên — không ước lượng giao điểm bằng mắt thường.',
    illustration: 'points',
    actionLabel: 'Mở Phòng thực hành',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-5',
    number: 5,
    title: 'Thực hiện thử thách đầu tiên',
    summary:
      'Mỗi thử thách cung cấp sẵn hình đề bài, giả thiết rõ ràng và bộ công cụ phù hợp để bạn tự tay dựng hình.',
    steps: [
      'Mở mục "Thử thách", chọn Cấp độ I – Dựng hình cơ bản và bắt đầu từ Bài 1: Dựng tam giác đều trên đoạn thẳng AB.',
      'Đọc kỹ khung đề bài gồm Giả thiết, Yêu cầu dựng hình và Công cụ được phép sử dụng.',
      'Dùng công cụ Đường tròn vẽ đường tròn tâm A đi qua B, sau đó vẽ đường tròn tâm B đi qua A.',
      'Tạo giao điểm C của hai đường tròn rồi dùng công cụ Đoạn thẳng nối CA và CB để hoàn thành tam giác đều ABC.',
    ],
    tip: `Hoàn thành bài hiện tại với ít nhất 1 sao sẽ tự động mở khóa bài kế tiếp trong lộ trình ${ALL_CHALLENGES.length} thử thách 2D.`,
    illustration: 'first-challenge',
    actionLabel: 'Làm thử thách đầu tiên ngay',
    actionType: 'challenge',
    actionTarget: 'L01_C01',
  },
  {
    id: 'guide-6',
    number: 6,
    title: 'Kiểm chứng phép dựng',
    summary:
      'Nút "Kiểm chứng" kiểm tra tính đúng đắn hình học bằng cách tự động di chuyển các điểm giả thiết qua nhiều vị trí khác nhau.',
    steps: [
      'Sau khi dựng xong đối tượng theo yêu cầu đề bài, nhấn nút "Kiểm chứng" màu xanh ngọc ở góc trên bên phải bảng vẽ.',
      'Hệ thống sẽ lần lượt thay đổi vị trí các điểm ban đầu và kiểm tra xem hình bạn dựng có giữ nguyên tính chất toán học ở mọi vị trí hay không.',
      'Nếu đúng ở mọi cấu hình, bạn nhận Sao 1 (Dựng hình chính xác), cùng Sao 2 nếu tối ưu số bước dựng (L) và Sao 3 nếu tối ưu số phép dựng cơ bản (E).',
      'Nếu hình chỉ đúng ở một vị trí cố định do đặt điểm ước lượng, hệ thống sẽ báo cụ thể nguyên nhân để bạn điều chỉnh lại cách dựng.',
    ],
    tip: 'Trước khi nhấn "Kiểm chứng", bạn có thể tự dùng công cụ "Chọn và di chuyển" kéo thử điểm giả thiết để kiểm tra xem hình có bị lệch không.',
    illustration: 'verify',
    actionLabel: 'Vào khu vực Thử thách',
    actionType: 'page',
    actionTarget: 'campaign',
  },
  {
    id: 'guide-7',
    number: 7,
    title: 'Xem gợi ý và lời giải',
    summary:
      'Khi gặp bài khó, bạn có thể mở từng mức gợi ý tăng dần hoặc xem hoạt ảnh lời giải từng bước kèm phần giải thích toán học.',
    steps: [
      'Ở bảng bên phải màn hình thử thách, mở mục "Gợi ý theo 3 mức" và nhấn xem lần lượt từ Mức 1 (Định hướng suy nghĩ), Mức 2 (Phương pháp dựng) đến Mức 3 (Thao tác cụ thể).',
      'Nếu vẫn cần tham khảo đầy đủ, nhấn nút "Xem lời giải" để mở trình phát lời giải từng bước.',
      'Trong trình phát lời giải, dùng các nút Bắt đầu, Bước trước, Bước tiếp theo, Tạm dừng, Làm lại, Tốc độ hoặc Toàn màn hình để theo dõi rõ từng nét dựng.',
      'Đọc phần "Chứng minh và nhận xét toán học" bên dưới để hiểu vì sao phép dựng luôn đúng trong trường hợp tổng quát.',
    ],
    tip: 'Lượt làm có mở lời giải chỉ dùng để tham khảo học tập. Hãy bấm "Làm lại" và tự tay dựng lại để ghi nhận sao cho bài đó.',
    illustration: 'hints',
    actionLabel: 'Tra cứu Thư viện kiến thức',
    actionType: 'page',
    actionTarget: 'library',
  },
  {
    id: 'guide-8',
    number: 8,
    title: 'Sử dụng phòng thực hành',
    summary:
      'Phòng thực hành mở toàn bộ công cụ dựng hình cơ bản, công cụ hỗ trợ, phép biến hình và đo đạc để bạn tự do sáng tạo.',
    steps: [
      'Mở mục "Phòng thực hành" trên thanh điều hướng để bắt đầu một trang vẽ mới hoặc mở lại các bản vẽ đã lưu.',
      'Chọn công cụ ở nhóm Cơ bản (điểm, đường thẳng, đường tròn) hoặc nhóm Hỗ trợ (trung điểm, đường trung trực, song song, phân giác, đo độ dài, đo góc).',
      'Nhấp vào một đối tượng để đổi màu nét, kiểu nét liền/nét đứt, độ dày hoặc kéo nhẹ tên nhãn điểm ra vị trí dễ nhìn mà không làm sai tọa độ.',
      'Đặt tiêu đề cho bản vẽ rồi nhấn "Lưu bản vẽ" để lưu giữ ngay trên máy tính hoặc điện thoại của bạn.',
    ],
    tip: 'Bạn có thể bật hoặc tắt lưới tọa độ và trục tọa độ ngay trên thanh công cụ của Phòng thực hành.',
    illustration: 'lab',
    actionLabel: 'Mở Phòng thực hành',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-9',
    number: 9,
    title: 'Tổ chức hoạt động trên lớp',
    summary:
      'Giáo viên có thể trình chiếu bất kỳ bài học nào, tự tạo bài tập mới và tổ chức thi đấu trực tiếp ngay tại lớp học.',
    steps: [
      'Vào "Mở rộng → Công cụ giáo viên" và bật "Chế độ Xem trước" để mở ngay mọi thử thách 2D – 3D phục vụ giảng dạy mà không ảnh hưởng tiến độ học sinh.',
      'Bật "Chế độ trình chiếu" (cỡ chữ lớn) khi dạy trên tivi, máy chiếu hoặc màn hình lớn trong lớp.',
      'Dùng thẻ "Tạo thử thách mới" để tự biên soạn đề bài, chèn ký hiệu toán học, chọn công cụ cho phép và lưu sẵn cho học sinh thực hành.',
      'Vào mục "Đấu trường" để tổ chức thi đấu Tư duy THPT (Toán 10 – 11 – 12) hoặc Dựng hình 2D kèm mã QR và bảng xếp hạng LED.',
    ],
    tip: 'Mọi tính năng trong Công cụ giáo viên và Đấu trường hoạt động hoàn toàn miễn phí và chạy trực tiếp ngay trên trình duyệt.',
    illustration: 'classroom',
    actionLabel: 'Mở Công cụ giáo viên',
    actionType: 'page',
    actionTarget: 'teacher',
  },
  {
    id: 'guide-10',
    number: 10,
    title: 'Xem kết quả và thành tích',
    summary: `Theo dõi tiến độ hoàn thành theo từng khối lớp THPT, tổng số sao trên thang ${ALL_CHALLENGES.length * 3} sao, ${BADGE_DEFINITIONS.length} huy hiệu và giấy chứng nhận A4.`,
    steps: [
      'Mở mục "Mở rộng → Thành tích học tập" để xem tổng số thử thách đã vượt qua, tỷ lệ hoàn thành từng khối lớp 10–11–12 và danh hiệu hiện tại.',
      `Theo dõi tiến độ mở khóa ${BADGE_DEFINITIONS.length} huy hiệu tương ứng với từng kỹ năng dựng hình và tư duy hình học.`,
      'Kéo xuống mục "Giấy chứng nhận thành tích" (hoặc chọn nhanh "Mở rộng → Giấy chứng nhận"), nhập họ tên học viên.',
      'Nhấn "Tải ảnh PNG (A4)" hoặc "In / Lưu PDF" để lưu lại giấy chứng nhận kết quả học tập.',
    ],
    tip: 'Bạn có thể làm lại bất kỳ thử thách cũ nào để cải thiện số bước dựng L và E nhằm đạt đủ 3 sao; hệ thống chỉ giữ lại kỷ lục tốt nhất.',
    illustration: 'achievements',
    actionLabel: 'Xem Thành tích học tập',
    actionType: 'page',
    actionTarget: 'achievements',
  },
  {
    id: 'guide-11',
    number: 11,
    title: 'Xuất hình vẽ',
    summary:
      'Lưu hình vẽ từ Phòng thực hành thành tệp ảnh sắc nét để chèn vào bài giảng, phiếu học tập hoặc báo cáo Toán học.',
    steps: [
      'Hoàn thiện hình vẽ trong Phòng thực hành, chỉnh màu sắc và vị trí nhãn điểm cho cân đối, rõ ràng.',
      'Tắt lưới tọa độ nếu bạn muốn hình vẽ có nền trắng sạch đẹp như hình minh họa trong sách giáo khoa.',
      'Nhấn nút "Xuất PNG" để tải ảnh chất lượng cao dùng ngay cho Word, PowerPoint hoặc gửi bài tập.',
      'Hoặc nhấn nút "Xuất SVG" để tải ảnh vector không bị vỡ nét khi phóng to in ấn khổ lớn.',
    ],
    tip: 'Bạn cũng có thể xuất trực tiếp Giấy chứng nhận thành tích khổ A4 ở trang Thành tích học tập.',
    illustration: 'export',
    actionLabel: 'Vẽ và xuất hình ngay',
    actionType: 'page',
    actionTarget: 'lab',
  },
  {
    id: 'guide-12',
    number: 12,
    title: 'Sao lưu dữ liệu và sử dụng ngoại tuyến',
    summary:
      'Mọi tiến độ học tập và bản vẽ được lưu an toàn trên thiết bị của bạn, có thể sao lưu sang máy khác và dùng cả khi không có mạng.',
    steps: [
      'Mở mục "Mở rộng → Sao lưu và khôi phục" (trong trang Cài đặt).',
      'Nhấn "Xuất tệp sao lưu" để tải về máy một tệp lưu toàn bộ số sao, bài đã hoàn thành, bản vẽ và danh sách lớp.',
      'Khi chuyển sang thiết bị khác hoặc cài lại trình duyệt, nhấn "Nhập & Khôi phục" và chọn tệp sao lưu đã lưu trước đó, rồi chọn Gộp dữ liệu hoặc Thay thế.',
      'Để học không cần kết nối mạng, nhấn nút "Cài đặt ứng dụng" (nếu trình duyệt hỗ trợ) để đưa Học Viện Hình Học Smart ra màn hình chính như một ứng dụng độc lập.',
    ],
    tip: 'Nên xuất một tệp sao lưu định kỳ mỗi khi hoàn thành nhiều cấp độ hoặc trước khi xóa dữ liệu trình duyệt.',
    illustration: 'backup',
    actionLabel: 'Mở Sao lưu & Cài đặt',
    actionType: 'page',
    actionTarget: 'settings',
  },
];

const GuideIllustration: React.FC<{ kind: GuideIllustrationId }> = ({ kind }) => {
  switch (kind) {
    case 'interface':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="10" y="12" width="300" height="28" rx="7" fill="#FFFFFF" stroke="#CBD5E1" />
          <circle cx="24" cy="26" r="6" fill="#0F766E" />
          <rect x="38" y="21" width="44" height="10" rx="4" fill="#0F766E" opacity="0.2" />
          <rect x="92" y="21" width="36" height="10" rx="4" fill="#0F766E" />
          <rect x="134" y="21" width="48" height="10" rx="4" fill="#CBD5E1" />
          <rect x="188" y="21" width="34" height="10" rx="4" fill="#CBD5E1" />
          <rect x="228" y="21" width="38" height="10" rx="4" fill="#CBD5E1" />
          <rect x="272" y="21" width="30" height="10" rx="4" fill="#94A3B8" />
          <rect x="14" y="52" width="182" height="84" rx="10" fill="#FFFFFF" stroke="#CBD5E1" />
          <circle cx="80" cy="96" r="24" fill="none" stroke="#0F766E" strokeWidth="1.8" strokeDasharray="4 3" />
          <circle cx="112" cy="96" r="24" fill="none" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="4 3" />
          <polygon points="80,96 112,96 96,68" fill="#0F766E" fillOpacity="0.12" stroke="#0F766E" strokeWidth="2" />
          <rect x="206" y="52" width="100" height="38" rx="8" fill="#F0FDFA" stroke="#99F6E4" />
          <rect x="216" y="62" width="60" height="7" rx="3" fill="#0F766E" opacity="0.7" />
          <rect x="216" y="75" width="76" height="6" rx="3" fill="#64748B" opacity="0.4" />
          <rect x="206" y="98" width="100" height="38" rx="8" fill="#FFFBEB" stroke="#FDE68A" />
          <rect x="216" y="108" width="54" height="7" rx="3" fill="#D97706" opacity="0.8" />
          <rect x="216" y="121" width="72" height="6" rx="3" fill="#64748B" opacity="0.4" />
        </svg>
      );
    case 'straightedge':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <line x1="36" y1="112" x2="284" y2="42" stroke="#0F766E" strokeWidth="2.5" />
          <g transform="rotate(-15.8 160 77)">
            <rect x="44" y="80" width="232" height="24" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
            <text x="160" y="96" textAnchor="middle" fontSize="10" fontWeight="700" fill="#92400E">THƯỚC THẲNG KHÔNG CHIA ĐỘ</text>
          </g>
          <circle cx="88" cy="97" r="6" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="232" cy="57" r="6" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
          <text x="76" y="85" fontSize="13" fontWeight="700" fill="#0F172A">A</text>
          <text x="236" y="47" fontSize="13" fontWeight="700" fill="#0F172A">B</text>
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <circle cx="135" cy="82" r="46" fill="none" stroke="#0284C7" strokeWidth="2.2" />
          <line x1="135" y1="82" x2="181" y2="82" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="4 3" />
          <line x1="158" y1="22" x2="135" y2="82" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <line x1="158" y1="22" x2="181" y2="82" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <circle cx="158" cy="22" r="6" fill="#0F766E" />
          <circle cx="135" cy="82" r="5" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="181" cy="82" r="5" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
          <text x="120" y="96" fontSize="12" fontWeight="700" fill="#0F172A">O (Tâm)</text>
          <text x="188" y="86" fontSize="12" fontWeight="700" fill="#0F172A">A (Bán kính)</text>
        </svg>
      );
    case 'points':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <circle cx="128" cy="80" r="44" fill="none" stroke="#0284C7" strokeWidth="2" />
          <line x1="48" y1="116" x2="266" y2="40" stroke="#0F766E" strokeWidth="2" />
          <circle cx="164" cy="55" r="12" fill="#D97706" fillOpacity="0.18" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="164" cy="55" r="5.5" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="91" cy="101" r="5" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
          <text x="178" y="48" fontSize="11" fontWeight="700" fill="#B45309">Giao điểm (bắt dính)</text>
        </svg>
      );
    case 'first-challenge':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <circle cx="125" cy="98" r="70" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx="195" cy="98" r="70" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" />
          <polygon points="125,98 195,98 160,37" fill="#0F766E" fillOpacity="0.12" stroke="#0F766E" strokeWidth="2.4" />
          <circle cx="125" cy="98" r="5" fill="#0F766E" />
          <circle cx="195" cy="98" r="5" fill="#0F766E" />
          <circle cx="160" cy="37" r="5.5" fill="#D97706" />
          <text x="111" y="114" fontSize="12" fontWeight="700" fill="#0F172A">A</text>
          <text x="200" y="114" fontSize="12" fontWeight="700" fill="#0F172A">B</text>
          <text x="166" y="34" fontSize="12" fontWeight="700" fill="#B45309">C</text>
        </svg>
      );
    case 'verify':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="22" y="20" width="122" height="32" rx="9" fill="#0F766E" />
          <text x="83" y="40" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">Kiểm chứng</text>
          <line x1="40" y1="110" x2="150" y2="110" stroke="#0F766E" strokeWidth="2.5" />
          <line x1="95" y1="68" x2="95" y2="132" stroke="#0284C7" strokeWidth="2" />
          <path d="M156 105 C170 96, 178 96, 190 105" fill="none" stroke="#D97706" strokeWidth="1.8" strokeDasharray="3 2" />
          <rect x="196" y="24" width="104" height="104" rx="10" fill="#ECFDF5" stroke="#6EE7B7" />
          <text x="248" y="48" textAnchor="middle" fontSize="11" fontWeight="700" fill="#065F46">Đánh giá 3 sao</text>
          <text x="208" y="72" fontSize="11" fontWeight="600" fill="#047857">★1 Chính xác</text>
          <text x="208" y="92" fontSize="11" fontWeight="600" fill="#047857">★2 Tối ưu L</text>
          <text x="208" y="112" fontSize="11" fontWeight="600" fill="#047857">★3 Tối ưu E</text>
        </svg>
      );
    case 'hints':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="18" y="18" width="136" height="30" rx="7" fill="#FFFBEB" stroke="#FCD34D" />
          <text x="28" y="37" fontSize="10.5" fontWeight="700" fill="#92400E">Mức 1 – Định hướng</text>
          <rect x="18" y="56" width="136" height="30" rx="7" fill="#FFFBEB" stroke="#FCD34D" />
          <text x="28" y="75" fontSize="10.5" fontWeight="700" fill="#92400E">Mức 2 – Phương pháp</text>
          <rect x="18" y="94" width="136" height="30" rx="7" fill="#FFFBEB" stroke="#FCD34D" />
          <text x="28" y="113" fontSize="10.5" fontWeight="700" fill="#92400E">Mức 3 – Thao tác cụ thể</text>
          <rect x="168" y="18" width="134" height="106" rx="10" fill="#FFFFFF" stroke="#CBD5E1" />
          <text x="235" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F766E">Lời giải từng bước</text>
          <rect x="184" y="58" width="102" height="8" rx="4" fill="#CCFBF1" />
          <rect x="184" y="58" width="62" height="8" rx="4" fill="#0F766E" />
          <rect x="184" y="82" width="44" height="24" rx="6" fill="#0F766E" />
          <text x="206" y="98" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">Bắt đầu</text>
          <rect x="234" y="82" width="52" height="24" rx="6" fill="#F1F5F9" stroke="#CBD5E1" />
          <text x="260" y="98" textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">Bước tiếp</text>
        </svg>
      );
    case 'lab':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="14" y="14" width="70" height="122" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
          <rect x="22" y="24" width="54" height="16" rx="4" fill="#0F766E" />
          <rect x="22" y="46" width="54" height="14" rx="4" fill="#E2E8F0" />
          <rect x="22" y="66" width="54" height="14" rx="4" fill="#E2E8F0" />
          <rect x="22" y="86" width="54" height="14" rx="4" fill="#E2E8F0" />
          <rect x="22" y="106" width="54" height="14" rx="4" fill="#E2E8F0" />
          <rect x="94" y="14" width="212" height="122" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
          <line x1="94" y1="75" x2="306" y2="75" stroke="#E2E8F0" strokeWidth="1" />
          <line x1="200" y1="14" x2="200" y2="136" stroke="#E2E8F0" strokeWidth="1" />
          <polygon points="150,112 252,112 204,42" fill="#0284C7" fillOpacity="0.1" stroke="#0284C7" strokeWidth="2" />
          <circle cx="201" cy="84" r="28" fill="none" stroke="#0F766E" strokeWidth="1.8" strokeDasharray="4 3" />
          <text x="195" y="128" fontSize="10" fontWeight="700" fill="#0F766E">AB = 6,40</text>
        </svg>
      );
    case 'classroom':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="18" y="16" width="180" height="118" rx="10" fill="#0F172A" />
          <text x="108" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5EEAD4">TRÌNH CHIẾU LỚP HỌC</text>
          <polygon points="62,110 154,110 108,58" fill="none" stroke="#38BDF8" strokeWidth="2.2" />
          <line x1="108" y1="58" x2="108" y2="110" stroke="#FBBF24" strokeWidth="1.8" strokeDasharray="4 3" />
          <rect x="210" y="16" width="92" height="54" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
          <text x="256" y="40" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F766E">Xem trước</text>
          <text x="256" y="56" textAnchor="middle" fontSize="10" fill="#475569">Toàn bộ bài học</text>
          <rect x="210" y="80" width="92" height="54" rx="8" fill="#FFFBEB" stroke="#FDE68A" />
          <text x="256" y="104" textAnchor="middle" fontSize="10" fontWeight="700" fill="#B45309">Đấu trường</text>
          <text x="256" y="120" textAnchor="middle" fontSize="10" fill="#78350F">Nhóm · Lớp học</text>
        </svg>
      );
    case 'achievements':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="18" y="20" width="130" height="110" rx="10" fill="#FFFFFF" stroke="#CBD5E1" />
          <text x="32" y="44" fontSize="11" fontWeight="700" fill="#0F766E">Tiến độ THPT</text>
          <rect x="32" y="54" width="102" height="8" rx="4" fill="#E2E8F0" />
          <rect x="32" y="54" width="68" height="8" rx="4" fill="#F59E0B" />
          <circle cx="48" cy="96" r="14" fill="#FEF3C7" stroke="#F59E0B" />
          <circle cx="84" cy="96" r="14" fill="#CCFBF1" stroke="#0F766E" />
          <circle cx="120" cy="96" r="14" fill="#E0F2FE" stroke="#0284C7" />
          <rect x="162" y="20" width="140" height="110" rx="8" fill="#FCFDFB" stroke="#0F766E" strokeWidth="2.5" />
          <text x="232" y="48" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0F766E">GIẤY CHỨNG NHẬN</text>
          <line x1="186" y1="68" x2="278" y2="68" stroke="#F59E0B" strokeWidth="2" />
          <text x="232" y="88" textAnchor="middle" fontSize="10" fill="#475569">Khổ A4 · Tải PNG / In PDF</text>
        </svg>
      );
    case 'export':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="24" y="24" width="132" height="102" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
          <circle cx="90" cy="75" r="32" fill="none" stroke="#0F766E" strokeWidth="2" />
          <polygon points="90,43 118,91 62,91" fill="#0F766E" fillOpacity="0.1" stroke="#0284C7" strokeWidth="2" />
          <path d="M164 75 L192 75" stroke="#0F766E" strokeWidth="2.5" />
          <polygon points="190,69 200,75 190,81" fill="#0F766E" />
          <rect x="208" y="30" width="88" height="38" rx="8" fill="#0F766E" />
          <text x="252" y="53" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFFFF">Xuất PNG</text>
          <rect x="208" y="82" width="88" height="38" rx="8" fill="#FFFFFF" stroke="#0F766E" strokeWidth="1.6" />
          <text x="252" y="105" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F766E">Xuất SVG</text>
        </svg>
      );
    case 'backup':
      return (
        <svg viewBox="0 0 320 150" className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700" aria-hidden="true">
          <rect x="22" y="26" width="124" height="98" rx="10" fill="#FFFFFF" stroke="#CBD5E1" />
          <text x="84" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F766E">Lưu trên thiết bị</text>
          <rect x="38" y="72" width="92" height="28" rx="7" fill="#0F766E" />
          <text x="84" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">Xuất tệp sao lưu</text>
          <rect x="174" y="26" width="124" height="98" rx="10" fill="#F0FDFA" stroke="#99F6E4" />
          <text x="236" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F766E">Dùng ngoại tuyến</text>
          <rect x="190" y="72" width="92" height="28" rx="7" fill="#FFFFFF" stroke="#0F766E" />
          <text x="236" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F766E">Khôi phục dữ liệu</text>
        </svg>
      );
  }
};

const GROUP_ICONS: React.FC<{ num: number }> = ({ num }) => {
  const cls = 'w-5 h-5 text-teal-700 dark:text-teal-400';
  switch (num) {
    case 1:
      return <BookOpen className={cls} />;
    case 2:
      return <Ruler className={cls} />;
    case 3:
      return <Compass className={cls} />;
    case 4:
      return <MapPin className={cls} />;
    case 5:
      return <Target className={cls} />;
    case 6:
      return <ShieldCheck className={cls} />;
    case 7:
      return <Lightbulb className={cls} />;
    case 8:
      return <PenTool className={cls} />;
    case 9:
      return <GraduationCap className={cls} />;
    case 10:
      return <Award className={cls} />;
    case 11:
      return <Download className={cls} />;
    default:
      return <HardDrive className={cls} />;
  }
};

const QuickTaskIcon: React.FC<{ num: number }> = ({ num }) => {
  const cls = 'w-5 h-5 text-teal-700 dark:text-teal-400';
  switch (num) {
    case 1:
      return <FilePlus2 className={cls} />;
    case 2:
      return <Compass className={cls} />;
    case 3:
      return <Box className={cls} />;
    case 4:
      return <SlidersHorizontal className={cls} />;
    case 5:
      return <FolderOpen className={cls} />;
    case 6:
      return <Save className={cls} />;
    case 7:
      return <Target className={cls} />;
    case 8:
      return <Maximize2 className={cls} />;
    default:
      return <WifiOff className={cls} />;
  }
};

export const GuidePage: React.FC = () => {
  const { setPage, setLabSubView, openChallenge, openLab3DWithScene, setTourOpen, setCampaignDimension } = useApp();
  const [guideTab, setGuideTab] = useState<'quick' | '2d' | '3d'>('quick');
  const [selectedId, setSelectedId] = useState<string>('all');

  const visibleGroups =
    selectedId === 'all'
      ? GUIDE_GROUPS
      : GUIDE_GROUPS.filter((g) => g.id === selectedId);

  const handleAction = (group: GuideGroup) => {
    if (group.actionType === 'challenge') {
      openChallenge(group.actionTarget);
      return;
    }
    if (group.actionType === 'tour') {
      setTourOpen(true);
      return;
    }
    setPage(group.actionTarget as Parameters<typeof setPage>[0]);
  };

  const handleQuickTaskAction = (task: QuickTaskGuide) => {
    if (task.actionTarget === 'campaign') {
      if (task.campaignDim) setCampaignDimension(task.campaignDim);
      setPage('campaign');
      return;
    }
    if (task.actionTarget === 'lab') {
      if (task.labMode) setLabSubView(task.labMode);
      setPage('lab');
      return;
    }
    setPage(task.actionTarget);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-400 mb-1.5">
            <HelpCircle className="w-4 h-4" />
            Cẩm nang thao tác ngắn gọn dành cho học sinh và giáo viên
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Hướng dẫn sử dụng Học Viện Hình Học Smart
          </h1>
          <p className="text-[15px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
            Tra cứu nhanh 9 tác vụ thường dùng nhất theo công dụng, vị trí công cụ và các bước thực hiện ngắn gọn; hoặc xem chi tiết hướng dẫn dựng hình 2D và 3D.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setTourOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[15px] font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Compass className="w-4 h-4 text-teal-700" />
            Mở hướng dẫn tương tác
          </button>
          <button
            type="button"
            onClick={() => openChallenge('L01_C01')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800"
          >
            <Play className="w-4 h-4 fill-current" />
            Bắt đầu thử thách đầu tiên
          </button>
        </div>
      </div>

      {/* Mode Switcher: Quick 9 tasks | 2D (12 parts) | 3D (6 parts) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          type="button"
          onClick={() => setGuideTab('quick')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-semibold transition-colors ${
            guideTab === 'quick'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Hướng dẫn nhanh (9 tác vụ cốt lõi)
        </button>
        <button
          type="button"
          onClick={() => setGuideTab('2d')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-semibold transition-colors ${
            guideTab === '2d'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          Chi tiết Hình học Phẳng 2D (12 phần)
        </button>
        <button
          type="button"
          onClick={() => setGuideTab('3d')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-semibold transition-colors ${
            guideTab === '3d'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-400'
          }`}
        >
          <Box className="w-4 h-4" />
          Chi tiết Hình học Không gian 3D (6 nhóm)
        </button>
      </div>

      {guideTab === 'quick' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {QUICK_TASK_GUIDES.map((task) => (
            <article
              key={task.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900 flex items-center justify-center shrink-0">
                    <QuickTaskIcon num={task.number} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Tác vụ {task.number} / 9
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                      {task.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-1.5 text-[15px]">
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    <strong className="font-semibold text-slate-900 dark:text-white">Công dụng: </strong>
                    {task.purpose}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200/70 dark:border-slate-700/70">
                    <strong className="font-semibold text-teal-800 dark:text-teal-300">Vị trí công cụ: </strong>
                    {task.location}
                  </p>
                </div>

                <ol className="space-y-2 text-[15px] text-slate-700 dark:text-slate-200">
                  {task.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono-tabular">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleQuickTaskAction(task)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 text-[15px] font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
                >
                  {task.actionLabel}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : guideTab === '3d' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {GUIDE_3D_GROUPS.map((g) => {
            const tpl = getTemplate3DById(g.templateId);
            const previewScene = tpl?.buildScene();
            return (
              <article
                key={g.id}
                className="rounded-2xl border border-sky-200/80 dark:border-sky-800/70 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-xs"
              >
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      Thao tác 3D · Nhóm {g.number} / 6
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {g.title}
                    </h3>
                  </div>
                  <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {g.summary}
                  </p>
                  {previewScene && (
                    <div className="h-40 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 overflow-hidden">
                      <LiveGeo3DPreview
                        scene={previewScene}
                        width={320}
                        height={170}
                        animate={false}
                        reducedMotion={true}
                      />
                    </div>
                  )}
                  <ol className="space-y-2 text-[15px] text-slate-700 dark:text-slate-200">
                    {g.steps.map((st, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono-tabular">
                          {idx + 1}
                        </span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 px-3.5 py-2.5 text-[15px] text-amber-950 dark:text-amber-200 leading-relaxed">
                    <strong className="font-semibold">Mẹo thực hành: </strong>
                    {g.tip}
                  </div>
                </div>
                {tpl && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => openLab3DWithScene(tpl.buildScene(), tpl.title)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-[15px] font-semibold hover:bg-sky-700"
                    >
                      Mở bản dựng mẫu để thực hành
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
      <>
      {/* Quick index of 12 groups */}
      <nav
        aria-label="Mục lục 12 phần hướng dẫn"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Mục lục nhanh (12 chủ đề hướng dẫn)
          </h2>
          {selectedId !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedId('all')}
              className="text-[15px] font-semibold text-teal-700 dark:text-teal-400 hover:underline"
            >
              Xem tất cả 12 phần
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {GUIDE_GROUPS.map((g) => {
            const active = selectedId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedId(active ? 'all' : g.id)}
                className={`flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border text-[15px] font-medium transition-colors ${
                  active
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 font-mono-tabular ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200'
                  }`}
                >
                  {g.number}
                </span>
                <span className="truncate">{g.title}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 12 Guide Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleGroups.map((group) => (
          <article
            key={group.id}
            id={group.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-xs"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900 flex items-center justify-center shrink-0">
                  <GroupIconWrapper num={group.number} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Phần {group.number} / 12
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {group.title}
                  </h3>
                </div>
              </div>

              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {group.summary}
              </p>

              {/* Visual illustration */}
              <GuideIllustration kind={group.illustration} />

              {/* Step-by-step instructions */}
              <ol className="space-y-2.5 text-[15px] text-slate-700 dark:text-slate-200">
                {group.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono-tabular">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {/* Practical tip */}
              <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 px-3.5 py-2.5 text-[15px] text-amber-950 dark:text-amber-200 leading-relaxed">
                <strong className="font-semibold">Mẹo thực hành: </strong>
                {group.tip}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => handleAction(group)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 text-[15px] font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
              >
                {group.actionLabel}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
      </>
      )}
    </div>
  );
};

const GroupIconWrapper: React.FC<{ num: number }> = ({ num }) => <GROUP_ICONS num={num} />;
