var LSZ
{
LSZ=32
if argument0=0
latp=ds_list_create()
else
ds_list_clear(latp)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(latp,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}