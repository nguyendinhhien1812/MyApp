// Sinh icon app iOS ra PNG đủ mọi kích thước, kèm Contents.json.
//
//   swift tools/RenderIcon.swift copper    # nền đồng, thanh kem  (mặc định)
//   swift tools/RenderIcon.swift cream     # nền kem, thanh đồng
//   swift tools/RenderIcon.swift copper /thư/mục/khác
//
// Dấu nhận diện là BA THANH của splash, cố ý BỎ chữ: ở 40pt chữ không đọc được,
// mà icon nhoè chữ trông rẻ tiền hơn là không có chữ.
//
// Luật của icon iOS, khác hẳn ảnh thường:
//   - KHÔNG kênh alpha. Có alpha là App Store từ chối.
//   - KHÔNG tự bo góc. iOS tự cắt mặt nạ; tự bo là viền đôi.
//   - Vẽ tràn viền, chừa lề trong để dấu không chạm mép sau khi bị cắt góc.

import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let repoRoot = URL(fileURLWithPath: CommandLine.arguments[0])
    .deletingLastPathComponent()
    .deletingLastPathComponent()
let defaultOut = repoRoot
    .appendingPathComponent("ios/MyApp/Images.xcassets/AppIcon.appiconset").path

let variant = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "copper"
let outDir = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : defaultOut

func rgb(_ hex: UInt32) -> CGColor {
    CGColor(srgbRed: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
}

// Ba sắc độ đồng, lấy từ SplashPlate*.colorset
struct Theme { let bgTop, bgBottom, bar1, bar2, bar3: UInt32 }
let themes: [String: Theme] = [
    // Nền đồng chuyển sắc, thanh kem — nổi trên mọi hình nền
    "copper": Theme(bgTop: 0xB07A28, bgBottom: 0x6E4A14,
                    bar1: 0xFFF6E6, bar2: 0xF2DCB4, bar3: 0xE0C084),
    // Nền kem, thanh đồng — giống splash nhất
    "cream": Theme(bgTop: 0xFBF9F5, bgBottom: 0xF0EAE0,
                   bar1: 0xF0C48A, bar2: 0xC98F3A, bar3: 0x8A5E1C),
]

guard let theme = themes[variant] else {
    fatalError("phương án không rõ: \(variant). Chọn 'copper' hoặc 'cream'.")
}

// Bố cục theo TỈ LỆ cạnh icon, để mọi kích thước nhìn giống hệt nhau
let BAR_H: CGFloat = 0.105          // chiều cao mỗi thanh
let BAR_GAP: CGFloat = 0.070        // khoảng cách giữa các thanh
let BAR_WIDTHS: [CGFloat] = [0.60, 0.52, 0.44]   // trên -> dưới, thu hẹp dần

func render(size: Int, to path: String) {
    let s = CGFloat(size)
    guard let ctx = CGContext(data: nil, width: size, height: size,
                              bitsPerComponent: 8, bytesPerRow: 0,
                              space: CGColorSpace(name: CGColorSpace.sRGB)!,
                              // noneSkipLast = KHÔNG có alpha, đúng yêu cầu của App Store
                              bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else {
        fatalError("không tạo được bitmap \(size)px")
    }
    ctx.setAllowsAntialiasing(true)

    // Nền chuyển sắc dọc
    let space = CGColorSpace(name: CGColorSpace.sRGB)!
    let grad = CGGradient(colorsSpace: space,
                          colors: [rgb(theme.bgTop), rgb(theme.bgBottom)] as CFArray,
                          locations: [0, 1])!
    ctx.drawLinearGradient(grad, start: CGPoint(x: 0, y: s), end: CGPoint(x: 0, y: 0),
                           options: [])

    // Ba thanh, khối căn giữa theo cả hai trục
    let barH = BAR_H * s
    let gap = BAR_GAP * s
    let blockH = barH * 3 + gap * 2
    var top = (s - blockH) / 2

    for (i, color) in [theme.bar1, theme.bar2, theme.bar3].enumerated() {
        let w = BAR_WIDTHS[i] * s
        // Toạ độ CoreGraphics gốc ở đáy, nên lật trục y
        let rect = CGRect(x: (s - w) / 2, y: s - top - barH, width: w, height: barH)
        ctx.setFillColor(rgb(color))
        ctx.addPath(CGPath(roundedRect: rect, cornerWidth: barH / 2,
                           cornerHeight: barH / 2, transform: nil))
        ctx.fillPath()
        top += barH + gap
    }

    guard let image = ctx.makeImage(),
          let dest = CGImageDestinationCreateWithURL(
            URL(fileURLWithPath: path) as CFURL, UTType.png.identifier as CFString, 1, nil)
    else { fatalError("không ghi được \(path)") }
    CGImageDestinationAddImage(dest, image, nil)
    guard CGImageDestinationFinalize(dest) else { fatalError("không lưu được \(path)") }
}

// (kích thước điểm, tỉ lệ, idiom) — bộ tối thiểu Xcode đòi cho iPhone + App Store
let specs: [(pt: CGFloat, scale: Int, idiom: String)] = [
    (20, 2, "iphone"), (20, 3, "iphone"),
    (29, 2, "iphone"), (29, 3, "iphone"),
    (40, 2, "iphone"), (40, 3, "iphone"),
    (60, 2, "iphone"), (60, 3, "iphone"),
    (1024, 1, "ios-marketing"),
]

try? FileManager.default.createDirectory(atPath: outDir,
                                         withIntermediateDirectories: true)

var entries: [String] = []
for spec in specs {
    let px = Int(spec.pt * CGFloat(spec.scale))
    let name = "icon-\(px).png"
    render(size: px, to: "\(outDir)/\(name)")
    let sizeStr = spec.pt == floor(spec.pt)
        ? "\(Int(spec.pt))x\(Int(spec.pt))" : "\(spec.pt)x\(spec.pt)"
    entries.append("""
        {
          "filename" : "\(name)",
          "idiom" : "\(spec.idiom)",
          "scale" : "\(spec.scale)x",
          "size" : "\(sizeStr)"
        }
    """)
}

let json = """
{
  "images" : [
\(entries.joined(separator: ",\n"))
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}

"""
try! json.write(toFile: "\(outDir)/Contents.json", atomically: true, encoding: .utf8)
print("đã sinh \(specs.count) icon (\(variant)) vào \(outDir)")
