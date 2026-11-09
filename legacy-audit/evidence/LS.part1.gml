var LSZ
{
LSZ=6
if argument0=0
ls=ds_list_create()
else
ds_list_clear(ls)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(ls,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}