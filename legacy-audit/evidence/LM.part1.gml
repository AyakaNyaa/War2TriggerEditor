var LSZ
{
LSZ=19
if argument0=0
lm=ds_list_create()
else
ds_list_clear(lm)
for (i=global.SZ; i<global.SZ+LSZ; i+=1)
{
ds_list_add(lm,ds_list_find_value(global.LANG,i))
}
global.SZ+=LSZ
}