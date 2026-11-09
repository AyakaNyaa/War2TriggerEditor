fn=''
//fn=get_open_filename('*.w2tr','*.w2tr')
fn=get_save_filename('*.w2tr','*.w2tr')
if fn!=''
{
if string_copy(fn,string_length(fn)-4,5)!='.w2tr'
fn+='.w2tr'
if file_exists(fn)
file_delete(fn)
f=file_text_open_append(fn)
file_text_close(f)
f=file_bin_open(fn,2)
for (i=0; i<ds_list_size(com); i+=1)
{
file_bin_write_byte(f,ds_list_find_value(com,i))
}
file_bin_write_byte(f,0)
file_bin_write_byte(f,253)
var tx;
{
tx=''
for (i=0; i<ds_list_size(global.VARS); i+=1)
{
tx=ds_list_find_value(global.VARS,i)
if tx!=''
{
file_bin_write_byte(f,i mod 256)
file_bin_write_byte(f,i div 256)
file_bin_write_byte(f,string_length(tx))
for (j=1; j<=string_length(tx); j+=1)
{
file_bin_write_byte(f,ord(string_char_at(tx,j)))
}
}
}
}
file_bin_close(f)
show_message("saved")
}
