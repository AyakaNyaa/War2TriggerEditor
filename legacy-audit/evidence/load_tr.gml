fn=''
fn=get_open_filename('*.w2tr','*.w2tr')
if fn!=''
{
if file_exists(fn)
{
f=file_bin_open(fn,2)
ds_list_clear(com)
var Stp,c1,c2,c3,c4;
{
c1=0 c2=0 c3=0 c4=0
Stp=1
while file_bin_position(f)<file_bin_size(f) and Stp
{
c1=c2 c2=c3 c3=c4
c4=file_bin_read_byte(f)
ds_list_add(com,c4)
if c1=254 and c2=237 and c3=0 and c4=253
{
ds_list_delete(com,ds_list_size(com)-1)
ds_list_delete(com,ds_list_size(com)-1)
Stp=0
}
}
}
var tx,v1,v2,n;
{
while file_bin_position(f)<file_bin_size(f)
{
v1=file_bin_read_byte(f)
v2=file_bin_read_byte(f)
n=file_bin_read_byte(f)
tx=''
for (j=0; j<n; j+=1)
{
tx+=chr(file_bin_read_byte(f))
}
if tx!=''
{
ds_list_replace(global.VARS,v1+v2*256,tx)
}
}
}
file_bin_close(f)
view_yview[0]=0
}
}
