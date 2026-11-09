var text, width, length, coptext, txln, txlnp;
text = argument0;
width = argument1;
length = string_length(text)
coptext = "";
txln = 0;
while(txln < length){
    txln += 1;
    coptext = string_copy(text,1,txln);
    
    var II,IIf
    {
    IIf=1
    while IIf
    {
    II=string_pos('%color[',coptext)
    if II!=0
    {
    coptext=string_delete(coptext,II,14)
    }
    else
    IIf=0
    }
    }
    
    if string_width(coptext) >= width{
        if string_pos(" ",text) > 0{
        txlnp=txln
            while(string_char_at(text,txln-1) != " "){
                txln -= 1;
                if txln=0
                {
                txln=txlnp
                break
                }
                }
            text = string_insert("#",text,txln);
            length = string_length(text);
            if length < txln{
                return text;
                }
            }
        else{
            text = string_insert("#",text,txln);
            length = string_length(text);
            if length < txln{
                return text;
                }
            }
        }
    }

return text;