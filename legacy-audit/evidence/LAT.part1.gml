var LSZ
{
LSZ=4
if argument0=0
lat=ds_list_create()
else
ds_list_clear(lat)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lat,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}