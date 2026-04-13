Option Explicit

' ============================================================
'  Zelera Deck - Sales Presentation Generator
'  Run this macro inside PowerPoint's VBA Editor (Alt + F11)
'  Then press F5 or click Run to generate the presentation.
' ============================================================

Sub CreateZeleraDeckPresentation()

    Dim prs As Presentation
    Dim sld As Slide
    Dim shp As Shape
    Dim txf As TextFrame
    Dim outPath As String

    ' --- Save location: same folder as this file ---
    outPath = "D:\Work\Zelera Deck\ZeleraDeck_Presentation.pptx"

    Set prs = Presentations.Add

    ' Widescreen 16:9
    With prs.PageSetup
        .SlideWidth = 960
        .SlideHeight = 540
    End With

    ' -------------------------------------------------------
    ' TITLE / COVER SLIDE
    ' -------------------------------------------------------
    Set sld = prs.Slides.Add(1, ppLayoutBlank)
    Call FillSlideGradient(sld, RGB(10, 10, 10), RGB(30, 30, 30))

    ' Decorative accent bar (top left)
    Call AddRect(sld, 0, 0, 8, 540, RGB(255, 200, 0))

    ' Main Title
    Call AddTextBox(sld, _
        Left:=60, Top:=140, Width:=840, Height:=100, _
        Text:="Zelera Deck", _
        FontSize:=52, Bold:=True, FontColor:=RGB(255, 255, 255), _
        Align:=ppAlignLeft)

    ' Subtitle
    Call AddTextBox(sld, _
        Left:=60, Top:=250, Width:=700, Height:=60, _
        Text:="Your Shop, Now in Every Customer's Pocket", _
        FontSize:=22, Bold:=False, FontColor:=RGB(200, 200, 200), _
        Align:=ppAlignLeft)

    ' Tag line pill
    Dim tagBox As Shape
    Set tagBox = sld.Shapes.AddShape(msoShapeRoundedRectangle, 60, 330, 320, 38)
    With tagBox.Fill
        .ForeColor.RGB = RGB(255, 200, 0)
        .Solid
    End With
    tagBox.Line.Visible = msoFalse
    With tagBox.TextFrame.TextRange
        .Text = "The Smarter Way to Sell Online"
        .Font.Size = 13
        .Font.Bold = True
        .Font.Color.RGB = RGB(10, 10, 10)
        .ParagraphFormat.Alignment = ppAlignCenter
    End With

    ' Slide number label
    Call AddTextBox(sld, 880, 510, 70, 24, "01 / 07", 9, False, RGB(100, 100, 100), ppAlignRight)

    ' -------------------------------------------------------
    ' SLIDE 2 — The Problem with Traditional Websites
    ' -------------------------------------------------------
    Set sld = prs.Slides.Add(2, ppLayoutBlank)
    Call FillSlideSolid(sld, RGB(248, 248, 248))
    Call BuildContentSlide(sld, _
        slideNum:="02 / 07", _
        accentColor:=RGB(220, 53, 69), _
        headingText:="The Problem with Traditional Websites", _
        subText:="Why old-school websites don't work for local shop owners", _
        bullets:=Array( _
            ChrW(9654) & "  Too Expensive — Thousands of rupees to build, plus never-ending monthly fees.", _
            ChrW(9654) & "  Too Complicated — Needs IT experts. You just want to run your shop, not a server.", _
            ChrW(9654) & "  Hard to Update — Changing a price or marking something sold out takes days." _
        ), _
        accentLabel:="The Problem")

    ' -------------------------------------------------------
    ' SLIDE 3 — Meet Zelera Deck
    ' -------------------------------------------------------
    Set sld = prs.Slides.Add(3, ppLayoutBlank)
    Call FillSlideSolid(sld, RGB(248, 248, 248))
    Call BuildContentSlide(sld, _
        slideNum:="03 / 07", _
        accentColor:=RGB(37, 211, 102), _
        headingText:="Meet Zelera Deck", _
        subText:="Designed for you — not programmers", _
        bullets:=Array( _
            ChrW(9654) & "  Zero Tech Skills — If you can use WhatsApp, you can run your Zelera Deck store.", _
            ChrW(9654) & "  Direct WhatsApp Orders — Customers order straight to your WhatsApp. No login, no cart, no confusion.", _
            ChrW(9654) & "  100% of Your Profits — We take zero commission. Every rupee goes to you." _
        ), _
        accentLabel:="The Solution")

    ' -------------------------------------------------------
    ' SLIDE 4 — Why Customers Love It
    ' -------------------------------------------------------
    Set sld = prs.Slides.Add(4, ppLayoutBlank)
    Call FillSlideSolid(sld, RGB(248, 248, 248))
    Call BuildContentSlide(sld, _
        slideNum:="04 / 07", _
        accentColor:=RGB(13, 110, 253), _
        headingText:="Why Your Customers Will Love It", _
        subText:="Give your buyers the shopping experience they expect", _
        bullets:=Array( _
            ChrW(9654) & "  Shop 24/7 — Customers browse your catalog anytime, even while you sleep.", _
            ChrW(9654) & "  Easy Search — Smart search & filters help buyers find exactly what they need in seconds.", _
            ChrW(9654) & "  Personal Touch — WhatsApp ordering keeps the warmth of your local business alive." _
        ), _
        accentLabel:="For Customers")

    ' -------------------------------------------------------
    ' SLIDE 5 — The Owner Dashboard
    ' -------------------------------------------------------
    Set sld = prs.Slides.Add(5, ppLayoutBlank)
    Call FillSlideSolid(sld, RGB(248, 248, 248))
    Call BuildContentSlide(sld, _
        slideNum:="05 / 07", _
        accentColor:=RGB(111, 66, 193), _
        headingText:="The Owner's Magic Dashboard", _
        subText:="Full control of your store — from your phone, in seconds", _
        bullets:=Array( _
            ChrW(9654) & "  Live Inventory — Mark items In Stock or Out of Stock instantly. No more apologizing to customers.", _
            ChrW(9654) & "  Look Professional — Your own custom shop link + logo. Share on Instagram, Facebook & WhatsApp Status.", _
            ChrW(9654) & "  Easy Management — Add products, set prices, and organise categories. All from your phone." _
        ), _
        accentLabel:="For Owners")

    ' -------------------------------------------------------
    ' SLIDE 6 — Pricing (HERO SLIDE)
    ' -------------------------------------------------------
    Set sld = prs.Slides.Add(6, ppLayoutBlank)
    Call FillSlideGradient(sld, RGB(10, 10, 10), RGB(25, 25, 25))
    Call AddRect(sld, 0, 0, 8, 540, RGB(255, 200, 0))

    Call AddTextBox(sld, 60, 30, 830, 30, "06 / 07", 9, False, RGB(80, 80, 80), ppAlignRight)

    Call AddTextBox(sld, 60, 50, 840, 50, _
        "Big Value. Tiny Price.", _
        42, True, RGB(255, 255, 255), ppAlignCenter)

    Call AddTextBox(sld, 60, 105, 840, 28, _
        "No hidden fees  |  No commissions  |  No IT guy needed", _
        13, False, RGB(180, 180, 180), ppAlignCenter)

    ' --- Card 1: Launch Offer ---
    Dim card1 As Shape
    Set card1 = sld.Shapes.AddShape(msoShapeRoundedRectangle, 100, 155, 330, 250)
    card1.Fill.ForeColor.RGB = RGB(255, 200, 0)
    card1.Fill.Solid
    card1.Line.Visible = msoFalse

    With card1.TextFrame
        .WordWrap = msoTrue
        .MarginLeft = 18
        .MarginTop = 18
        .MarginRight = 18
        With .TextRange
            .Text = "Launch Offer" & Chr(13) & Chr(13) & _
                    ChrW(8377) & "1,599" & Chr(13) & _
                    "First 3 Months" & Chr(13) & Chr(13) & _
                    "~" & ChrW(8377) & "533 / month" & Chr(13) & _
                    "Less than a cup of chai per day!"
            .Font.Color.RGB = RGB(10, 10, 10)
            .Paragraphs(1).Font.Size = 14
            .Paragraphs(1).Font.Bold = True
            .Paragraphs(2).Font.Size = 10
            .Paragraphs(3).Font.Size = 38
            .Paragraphs(3).Font.Bold = True
            .Paragraphs(4).Font.Size = 14
            .Paragraphs(4).Font.Bold = True
            .Paragraphs(5).Font.Size = 10
            .Paragraphs(6).Font.Size = 11
            .Paragraphs(6).Font.Bold = False
        End With
    End With

    ' --- Card 2: Standard Plan ---
    Dim card2 As Shape
    Set card2 = sld.Shapes.AddShape(msoShapeRoundedRectangle, 470, 155, 330, 250)
    card2.Fill.ForeColor.RGB = RGB(35, 35, 35)
    card2.Fill.Solid
    card2.Line.ForeColor.RGB = RGB(70, 70, 70)
    card2.Line.Weight = 1.5

    With card2.TextFrame
        .WordWrap = msoTrue
        .MarginLeft = 18
        .MarginTop = 18
        .MarginRight = 18
        With .TextRange
            .Text = "Standard Plan" & Chr(13) & Chr(13) & _
                    ChrW(8377) & "699" & Chr(13) & _
                    "Per Month" & Chr(13) & Chr(13) & _
                    "After your first 3 months" & Chr(13) & _
                    "Cancel anytime, no lock-in."
            .Font.Color.RGB = RGB(220, 220, 220)
            .Paragraphs(1).Font.Size = 14
            .Paragraphs(1).Font.Bold = True
            .Paragraphs(2).Font.Size = 10
            .Paragraphs(3).Font.Size = 38
            .Paragraphs(3).Font.Bold = True
            .Paragraphs(4).Font.Size = 14
            .Paragraphs(4).Font.Bold = True
            .Paragraphs(5).Font.Size = 10
            .Paragraphs(6).Font.Size = 11
            .Paragraphs(7).Font.Size = 11
        End With
    End With

    ' Guarantee badge
    Call AddTextBox(sld, 60, 420, 840, 28, _
        "GUARANTEE: Zero commissions on every sale. You keep every single rupee.", _
        12, True, RGB(255, 200, 0), ppAlignCenter)

    ' -------------------------------------------------------
    ' SLIDE 7 — Call to Action
    ' -------------------------------------------------------
    Set sld = prs.Slides.Add(7, ppLayoutBlank)
    Call FillSlideGradient(sld, RGB(10, 10, 10), RGB(30, 30, 30))
    Call AddRect(sld, 0, 0, 8, 540, RGB(37, 211, 102))

    Call AddTextBox(sld, 60, 30, 830, 30, "07 / 07", 9, False, RGB(80, 80, 80), ppAlignRight)

    Call AddTextBox(sld, 60, 90, 840, 70, _
        "Let's Grow Your Business Today", _
        40, True, RGB(255, 255, 255), ppAlignCenter)

    Call AddTextBox(sld, 60, 170, 840, 36, _
        "Don't let bigger competitors steal your loyal customers.", _
        17, False, RGB(200, 200, 200), ppAlignCenter)

    ' Bullet points
    Dim ctaBullets(2) As String
    ctaBullets(0) = ChrW(10003) & "  Your own digital store — live within hours"
    ctaBullets(1) = ChrW(10003) & "  Orders come directly to your WhatsApp"
    ctaBullets(2) = ChrW(10003) & "  Start for just " & ChrW(8377) & "1,599 for the first 3 months"

    Dim i As Integer
    For i = 0 To 2
        Call AddTextBox(sld, 250, 235 + i * 45, 460, 38, _
            ctaBullets(i), 15, False, RGB(180, 180, 180), ppAlignLeft)
    Next i

    ' CTA Button
    Dim ctaBtn As Shape
    Set ctaBtn = sld.Shapes.AddShape(msoShapeRoundedRectangle, 330, 400, 300, 52)
    ctaBtn.Fill.ForeColor.RGB = RGB(37, 211, 102)
    ctaBtn.Fill.Solid
    ctaBtn.Line.Visible = msoFalse
    With ctaBtn.TextFrame.TextRange
        .Text = "Get Started with Zelera Deck"
        .Font.Size = 14
        .Font.Bold = True
        .Font.Color.RGB = RGB(10, 10, 10)
        .ParagraphFormat.Alignment = ppAlignCenter
    End With

    ' -------------------------------------------------------
    ' APPLY FONT (Calibri is safe; change to Segoe UI etc.)
    ' -------------------------------------------------------
    Call ApplyFontToAll(prs, "Calibri")

    ' -------------------------------------------------------
    ' SAVE
    ' -------------------------------------------------------
    prs.SaveAs outPath, ppSaveAsOpenXMLPresentation
    MsgBox "Presentation saved!" & Chr(13) & Chr(13) & outPath, vbInformation, "Zelera Deck"

End Sub

' ============================================================
'  HELPER: Build a standard content slide
' ============================================================
Private Sub BuildContentSlide(sld As Slide, slideNum As String, _
    accentColor As Long, headingText As String, subText As String, _
    bullets As Variant, accentLabel As String)

    ' White background already set by caller
    ' Accent bar on left
    Call AddRect(sld, 0, 0, 8, 540, accentColor)

    ' Slide number
    Call AddTextBox(sld, 880, 510, 70, 24, slideNum, 9, False, RGB(180, 180, 180), ppAlignRight)

    ' Accent badge
    Dim badge As Shape
    Set badge = sld.Shapes.AddShape(msoShapeRoundedRectangle, 40, 42, 130, 26)
    badge.Fill.ForeColor.RGB = accentColor
    badge.Fill.Solid
    badge.Line.Visible = msoFalse
    With badge.TextFrame.TextRange
        .Text = accentLabel
        .Font.Size = 10
        .Font.Bold = True
        .Font.Color.RGB = RGB(255, 255, 255)
        .ParagraphFormat.Alignment = ppAlignCenter
    End With

    ' Heading
    Call AddTextBox(sld, 40, 80, 880, 70, headingText, 30, True, RGB(10, 10, 10), ppAlignLeft)

    ' Sub-heading
    Call AddTextBox(sld, 40, 155, 880, 28, subText, 14, False, RGB(100, 100, 100), ppAlignLeft)

    ' Divider line
    Dim ln As Shape
    Set ln = sld.Shapes.AddLine(40, 190, 920, 190)
    ln.Line.ForeColor.RGB = RGB(230, 230, 230)
    ln.Line.Weight = 1

    ' Bullet items
    Dim i As Integer
    Dim yPos As Single
    yPos = 210
    For i = 0 To UBound(bullets)
        ' Bullet card background
        Dim bulletCard As Shape
        Set bulletCard = sld.Shapes.AddShape(msoShapeRoundedRectangle, 40, yPos, 870, 85)
        bulletCard.Fill.ForeColor.RGB = RGB(252, 252, 252)
        bulletCard.Fill.Solid
        bulletCard.Line.ForeColor.RGB = RGB(235, 235, 235)
        bulletCard.Line.Weight = 0.75

        ' Bullet text inside card
        With bulletCard.TextFrame
            .MarginLeft = 18
            .MarginTop = 10
            .MarginRight = 10
            .WordWrap = msoTrue
            With .TextRange
                .Text = bullets(i)
                .Font.Size = 14
                .Font.Color.RGB = RGB(30, 30, 30)
            End With
        End With

        yPos = yPos + 93
    Next i
End Sub

' ============================================================
'  HELPER: Add a text box
' ============================================================
Private Sub AddTextBox(sld As Slide, Left As Single, Top As Single, _
    Width As Single, Height As Single, Text As String, _
    FontSize As Single, Bold As Boolean, FontColor As Long, _
    Align As PpParagraphAlignment)

    Dim shp As Shape
    Set shp = sld.Shapes.AddTextbox(msoTextOrientationHorizontal, Left, Top, Width, Height)
    With shp.TextFrame
        .AutoSize = ppAutoSizeNone
        .WordWrap = msoTrue
        With .TextRange
            .Text = Text
            .Font.Size = FontSize
            .Font.Bold = Bold
            .Font.Color.RGB = FontColor
            .ParagraphFormat.Alignment = Align
        End With
    End With
End Sub

' ============================================================
'  HELPER: Add a solid filled rectangle (no border)
' ============================================================
Private Sub AddRect(sld As Slide, Left As Single, Top As Single, _
    Width As Single, Height As Single, FillColor As Long)

    Dim shp As Shape
    Set shp = sld.Shapes.AddShape(msoShapeRectangle, Left, Top, Width, Height)
    shp.Fill.ForeColor.RGB = FillColor
    shp.Fill.Solid
    shp.Line.Visible = msoFalse
End Sub

' ============================================================
'  HELPER: Fill slide with a solid color
' ============================================================
Private Sub FillSlideSolid(sld As Slide, bgColor As Long)
    With sld.Background.Fill
        .ForeColor.RGB = bgColor
        .Solid
    End With
End Sub

' ============================================================
'  HELPER: Fill slide with a two-color gradient (dark theme)
' ============================================================
Private Sub FillSlideGradient(sld As Slide, color1 As Long, color2 As Long)
    With sld.Background.Fill
        .Visible = msoTrue
        .ForeColor.RGB = color1
        .BackColor.RGB = color2
        .TwoColorGradient msoGradientFromCorner, 1
    End With
End Sub

' ============================================================
'  HELPER: Apply a font across all text in the presentation
' ============================================================
Private Sub ApplyFontToAll(prs As Presentation, fontName As String)
    Dim sld As Slide
    Dim shp As Shape
    For Each sld In prs.Slides
        For Each shp In sld.Shapes
            If shp.HasTextFrame Then
                Dim tr As TextRange
                Set tr = shp.TextFrame.TextRange
                tr.Font.Name = fontName
            End If
        Next shp
    Next sld
End Sub
