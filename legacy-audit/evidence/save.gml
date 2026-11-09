var c1,c2,c3,c4,cSZ
{
fn=''
//fn=get_open_filename('*.pud','*.pud')
fn=get_save_filename('*.pud','*.pud')
if fn!=''
{
if string_copy(fn,string_length(fn)-3,4)!='.pud'
fn+='.pud'
if file_exists(fn)
{
f=file_bin_open(fn,2)
c1='' c2='' c3='' c4=''
while (c1+c2+c3+c4!="OILM")
{
c1=c2 c2=c3 c3=c4
c4=chr(file_bin_read_byte(f))
}
cSZ=0
for (i=0; i<4; i+=1)
{
c1=file_bin_read_byte(f)
cSZ+=power(256,i)*c1
}
if ds_list_size(com)<=cSZ
{
for (i=0; i<ds_list_size(com); i+=1)
{
file_bin_write_byte(f,ds_list_find_value(com,i))
}
file_bin_close(f)
show_message("saved")
}
else
{
file_bin_close(f)
show_message(lstr(188)+'#'+lstr(189)+' '+string(cSZ)+' '+lstr(191)+'#'
+lstr(190)+' '+string(ds_list_size(com))+' '+lstr(191)
)
}
}
}
}
