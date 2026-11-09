var c1,c2,c3,c4,cSZ
{
fn=''
fn=get_open_filename('*.pud','*.pud')
if fn!=''
{
ds_list_clear(com)
f=file_bin_open(fn,0)
c1='' c2='' c3='' c4=''
while (c1+c2+c3+c4!="OILM")
{
c1=c2 c2=c3 c3=c4
c4=chr(file_bin_read_byte(f))
}
cSZ=0
for (i=0; i<4; i+=1)
{
c1=file_bin_read_byte(f)
cSZ+=power(256,i)*c1
}
c4=0
c3=0
c1=2
while (c1 and c3<cSZ)
{
c4=file_bin_read_byte(f)
if c1=2
{
if c4=237
c1=0
else
c1=1
}
if c4=254
c1=2
ds_list_add(com,c4)
c3+=1
}
if c1!=0
{
ne=0
ds_list_clear(com)
}
file_bin_close(f)
view_yview[0]=0
}
}
