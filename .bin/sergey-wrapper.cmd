mkdir --parents ./templates/imports
call .\node_modules\.bin\sergey --root=./templates/ --output=./out --imports=./imports --exclude=out,imports
move /Y .\templates\out\*.html .\
rmdir .\templates\out
