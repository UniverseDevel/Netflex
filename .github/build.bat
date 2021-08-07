cd ..
7z a -xr"!.*" "..\Netflix Extended.part.zip" "*"
cd ..
del "Netflix Extended.zip"
move "Netflix Extended.part.zip" "Netflix Extended.zip"
pause