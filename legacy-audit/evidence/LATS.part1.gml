var LSZ
{
LSZ=2
if argument0=0
lats=ds_list_create()
else
ds_list_clear(lats)
for (i=0; i<12; i+=1)
{
ds_list_add(lats,ds_list_find_value(lm,i))
}
ds_list_add(lats,ds_list_find_value(global.LANG,global.SZ))
for (i=12; i<19; i+=1)
{
ds_list_add(lats,ds_list_find_value(lm,i))
}
ds_list_add(lats,ds_list_find_value(global.LANG,global.SZ+1))
for (i=20; i<32; i+=1)
{
ds_list_add(lats,string(i+1))
}
global.SZ+=LSZ
}