if drawer2.AC=1
{
if global.ret[0]=7
{
if c=0
{
if T<8
{
global.ret[2] = global.ret[2] | (1<<T)
}
if T=8
{
g = global.ret[3] | 1
global.ret[3]=g
}
if T=9
{
g = global.ret[3] | 2
global.ret[3]=g
}
exit
}
else
{
if T<8
{
global.ret[2] = global.ret[2] & ~(1<<T)
}
if T=8
{
global.ret[3] = global.ret[3] & ~1
}
if T=9
{
global.ret[3] = global.ret[3] & ~2
}
exit
}
}
if global.ret[0]=96
{
if c=0
{
if T<8
{
global.ret[3] = global.ret[3] | (1<<T)
}
exit
}
else
{
if T<8
{
global.ret[3] = global.ret[3] & ~(1<<T)
}
}
}
if global.ret[0]=6 and global.ret[1]=18
{
if c=0
{
if T<8
{
global.ret[2] = global.ret[2] | (1<<T)
}
exit
}
else
{
if T<8
{
global.ret[2] = global.ret[2] & ~(1<<T)
}
}
}
}