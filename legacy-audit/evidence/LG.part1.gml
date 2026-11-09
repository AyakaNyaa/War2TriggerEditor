var LSZ
{
LSZ=152
if argument0=0
lg=ds_list_create()
else
ds_list_clear(lg)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lg,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}