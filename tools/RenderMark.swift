// Render khối logo cho màn splash ra PNG @1x/@2x/@3x, hai biến thể sáng/tối.
//
//   swift tools/RenderMark.swift              # ghi thẳng vào Images.xcassets
//   swift tools/RenderMark.swift /thư/mục/khác
//
// Vì sao phải render ảnh thay vì dựng bằng view trong storyboard:
// launch screen của iOS không cho đặt userDefinedRuntimeAttributes (nên không có
// layer.cornerRadius) và named color gán cho textColor của label làm ibtool chết câm.
//
// QUAN TRỌNG: mọi con số bố cục dưới đây phải khớp với src/components/Splash/index.tsx
// — lớp JS vẽ lại đúng bố cục này rồi mới chạy động tác thoát. Lệch một chỗ là lúc
// native nhường cho JS sẽ thấy logo nhảy.
//
// Sau khi render nhớ build lại app. iOS cache launch screen ở tầng hệ thống, gỡ app
// rồi cài lại KHÔNG xoá được — phải tắt hẳn simulator rồi bật lại mới thấy ảnh mới.

import Foundation
import CoreGraphics
import CoreText
import ImageIO
import UniformTypeIdentifiers

// tools/RenderMark.swift -> lùi 2 cấp là gốc repo, để chạy được ở máy bất kỳ
let repoRoot = URL(fileURLWithPath: #filePath)
    .deletingLastPathComponent()
    .deletingLastPathComponent()
let fontDir = repoRoot.appendingPathComponent("assets/fonts").path
let defaultOut = repoRoot
    .appendingPathComponent("ios/MyApp/Images.xcassets/SplashMark.imageset").path
let outDir = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : defaultOut

// ─── Bố cục (điểm, gốc toạ độ ở mép trên canvas) ─────────────────────────────
let W: CGFloat = 200, H: CGFloat = 164
let BAR_H: CGFloat = 14, BAR_R: CGFloat = 7
let BAR_WIDTHS: [CGFloat] = [168, 152, 134]   // trên -> dưới
let BAR_TOPS: [CGFloat] = [0, 24, 48]
let WORDMARK_TOP: CGFloat = 90
let RULE_TOP: CGFloat = 134, RULE_W: CGFloat = 84, RULE_H: CGFloat = 2
let SUB_TOP: CGFloat = 150

func loadFont(_ file: String, _ size: CGFloat) -> CTFont {
    let url = URL(fileURLWithPath: "\(fontDir)/\(file)") as CFURL
    guard let provider = CGDataProvider(url: url), let cg = CGFont(provider) else {
        fatalError("không đọc được font \(file) trong \(fontDir)")
    }
    return CTFontCreateWithGraphicsFont(cg, size, nil, nil)
}

func rgb(_ hex: UInt32) -> CGColor {
    CGColor(srgbRed: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
}

// Trùng với PALETTE trong Splash/index.tsx và các colorset Splash*.colorset
struct Palette { let p1, p2, p3, text, rule, sub: UInt32 }
let light = Palette(p1: 0xF0C48A, p2: 0xC98F3A, p3: 0x8A5E1C,
                    text: 0x1A1A1A, rule: 0x8A5E1C, sub: 0x888888)
let dark = Palette(p1: 0x6B4F22, p2: 0x96682C, p3: 0xD8B783,
                   text: 0xD8B783, rule: 0xB68235, sub: 0x8A7A63)

// Vẽ chữ căn giữa theo trục ngang; topY tính từ đỉnh canvas
func drawText(_ ctx: CGContext, _ s: String, _ font: CTFont, _ color: UInt32,
              topY: CGFloat, tracking: CGFloat) {
    let attrs: [CFString: Any] = [
        kCTFontAttributeName: font,
        kCTForegroundColorAttributeName: rgb(color),
        kCTKernAttributeName: tracking,
    ]
    let attributed = CFAttributedStringCreate(nil, s as CFString, attrs as CFDictionary)!
    let line = CTLineCreateWithAttributedString(attributed)
    let bounds = CTLineGetBoundsWithOptions(line, .useOpticalBounds)
    let x = (W - bounds.width) / 2 - bounds.minX
    ctx.textPosition = CGPoint(x: x, y: H - topY - CTFontGetAscent(font))
    CTLineDraw(line, ctx)
}

func roundedBar(_ ctx: CGContext, topY: CGFloat, w: CGFloat, color: UInt32) {
    let r = CGRect(x: (W - w) / 2, y: H - topY - BAR_H, width: w, height: BAR_H)
    ctx.setFillColor(rgb(color))
    ctx.addPath(CGPath(roundedRect: r, cornerWidth: BAR_R, cornerHeight: BAR_R, transform: nil))
    ctx.fillPath()
}

func render(_ pal: Palette, scale: CGFloat, to path: String) {
    guard let ctx = CGContext(data: nil, width: Int(W * scale), height: Int(H * scale),
                              bitsPerComponent: 8, bytesPerRow: 0,
                              space: CGColorSpace(name: CGColorSpace.sRGB)!,
                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
        fatalError("không tạo được bitmap context")
    }
    ctx.scaleBy(x: scale, y: scale)
    ctx.setAllowsAntialiasing(true)

    for (i, color) in [pal.p3, pal.p2, pal.p1].enumerated() {
        roundedBar(ctx, topY: BAR_TOPS[i], w: BAR_WIDTHS[i], color: color)
    }

    drawText(ctx, "MyApp", loadFont("BeVietnamPro-Bold.ttf", 28), pal.text,
             topY: WORDMARK_TOP, tracking: 0.5)

    ctx.setFillColor(rgb(pal.rule))
    ctx.fill(CGRect(x: (W - RULE_W) / 2, y: H - RULE_TOP - RULE_H, width: RULE_W, height: RULE_H))

    drawText(ctx, "PORTFOLIO · RN ENGINEER", loadFont("BeVietnamPro-Medium.ttf", 10),
             pal.sub, topY: SUB_TOP, tracking: 1.4)

    guard let img = ctx.makeImage(),
          let dest = CGImageDestinationCreateWithURL(
            URL(fileURLWithPath: path) as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        fatalError("không ghi được \(path)")
    }
    CGImageDestinationAddImage(dest, img, nil)
    CGImageDestinationFinalize(dest)
}

for (name, pal) in [("light", light), ("dark", dark)] {
    for s in [1, 2, 3] {
        render(pal, scale: CGFloat(s), to: "\(outDir)/mark-\(name)\(s == 1 ? "" : "@\(s)x").png")
    }
}
print("đã render 6 ảnh vào \(outDir)")

// Số liệu font để canh chữ bên React Native: baseline trong ảnh nằm ở
// WORDMARK_TOP + ascent, còn RN với lineHeight L đặt baseline ở top + (L - (asc+desc))/2 + asc.
let f = loadFont("BeVietnamPro-Bold.ttf", 28)
print(String(format: "MyApp 28pt -> ascent=%.2f descent=%.2f, baseline trong ảnh = %.2f",
             CTFontGetAscent(f), CTFontGetDescent(f), WORDMARK_TOP + CTFontGetAscent(f)))
