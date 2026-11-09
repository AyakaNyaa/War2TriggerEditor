var LSZ
{
LSZ=111
if argument0=0
lu=ds_list_create()
else
ds_list_clear(lu)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lu,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}