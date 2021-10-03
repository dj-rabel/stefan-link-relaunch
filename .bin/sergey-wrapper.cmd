call sergey --root=./templates/ --output=./_out --exclude=_out,_imports
move /Y .\templates\_out\*.html .\
rmdir .\templates\_out
