g/^namespace: cellular_component$/normal dip
g/^namespace: molecular_function$/normal dip
%s/\n\n\n\n*/\r\r/
w go-basic-process.obo
e!

g/^namespace: biological_process$/normal dip
g/^namespace: molecular_function$/normal dip
%s/\n\n\n\n*/\r\r/
w go-basic-component.obo
e!

g/^namespace: biological_process$/normal dip
g/^namespace: cellular_component$/normal dip
%s/\n\n\n\n*/\r\r/
w go-basic-function.obo
e!
