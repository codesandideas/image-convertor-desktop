; Custom NSIS script for context menu integration

!macro customInstall
  ; Add context menu entries for each supported image format
  ; Using HKCU (current user) to avoid requiring admin privileges

  WriteRegStr HKCU "Software\Classes\.jpg\shell\ImageConverter" "" "Convert with Image Converter"
  WriteRegStr HKCU "Software\Classes\.jpg\shell\ImageConverter" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\.jpg\shell\ImageConverter\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  WriteRegStr HKCU "Software\Classes\.jpeg\shell\ImageConverter" "" "Convert with Image Converter"
  WriteRegStr HKCU "Software\Classes\.jpeg\shell\ImageConverter" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\.jpeg\shell\ImageConverter\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  WriteRegStr HKCU "Software\Classes\.png\shell\ImageConverter" "" "Convert with Image Converter"
  WriteRegStr HKCU "Software\Classes\.png\shell\ImageConverter" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\.png\shell\ImageConverter\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  WriteRegStr HKCU "Software\Classes\.webp\shell\ImageConverter" "" "Convert with Image Converter"
  WriteRegStr HKCU "Software\Classes\.webp\shell\ImageConverter" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\.webp\shell\ImageConverter\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  WriteRegStr HKCU "Software\Classes\.avif\shell\ImageConverter" "" "Convert with Image Converter"
  WriteRegStr HKCU "Software\Classes\.avif\shell\ImageConverter" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\.avif\shell\ImageConverter\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  WriteRegStr HKCU "Software\Classes\.tiff\shell\ImageConverter" "" "Convert with Image Converter"
  WriteRegStr HKCU "Software\Classes\.tiff\shell\ImageConverter" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\.tiff\shell\ImageConverter\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  WriteRegStr HKCU "Software\Classes\.tif\shell\ImageConverter" "" "Convert with Image Converter"
  WriteRegStr HKCU "Software\Classes\.tif\shell\ImageConverter" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\.tif\shell\ImageConverter\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Refresh shell to update context menu
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend

!macro customUnInstall
  ; Remove all context menu entries on uninstall
  DeleteRegKey HKCU "Software\Classes\.jpg\shell\ImageConverter"
  DeleteRegKey HKCU "Software\Classes\.jpeg\shell\ImageConverter"
  DeleteRegKey HKCU "Software\Classes\.png\shell\ImageConverter"
  DeleteRegKey HKCU "Software\Classes\.webp\shell\ImageConverter"
  DeleteRegKey HKCU "Software\Classes\.avif\shell\ImageConverter"
  DeleteRegKey HKCU "Software\Classes\.tiff\shell\ImageConverter"
  DeleteRegKey HKCU "Software\Classes\.tif\shell\ImageConverter"

  ; Refresh shell to update context menu
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend
