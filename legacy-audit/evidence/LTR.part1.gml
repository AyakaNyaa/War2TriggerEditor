var LSZ
{
LSZ=9
if argument0=0
ltr=ds_list_create()
else
ds_list_clear(ltr)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(ltr,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}