var_mmsize = 1
mmi[00] = lstr(4)
sms[00] = 9
for (i=0; i<8; i+=1)
{
smi[00,i] = ds_list_find_value(drawer2.lp,i)
}
smi[00,8] = ds_list_find_value(drawer2.lp,16)