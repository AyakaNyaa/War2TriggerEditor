if file_exists(argument0)
{
ds_list_clear(global.TLANG)
FfF=file_text_open_read(argument0)
file_text_readln(FfF)
while !file_text_eof(FfF)
{
ds_list_add(global.TLANG,file_text_read_string(FfF))
file_text_readln(FfF)
}
file_text_close(FfF)
if ds_list_size(global.TLANG)!=global.LANG_SIZE
{
show_message("FATALL ERROOORRRRR! !!!?!!#LANG FILE CORRUPTED")
}
else
{
global.LAST_LANG=argument0
ds_list_clear(global.LANG)
FfF=file_text_open_read(argument0)
global.LANGT=file_text_read_string(FfF)
file_text_readln(FfF)
while !file_text_eof(FfF)
{
ds_list_add(global.LANG,file_text_read_string(FfF))
file_text_readln(FfF)
}
file_text_close(FfF)
GET_LISTS()
}
}