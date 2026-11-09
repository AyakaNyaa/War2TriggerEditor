var str, X, symb, Y,oldc;
{
oldc=draw_get_color()
str=argument2
Xs=0
Ys=0
for(II=1;II<string_length(str)+1;II+=1)
{
if string_copy(str,II,7)='%color['
{
if global.COLB=0
{
draw_set_color(make_color_rgb(
real(string_copy(str,II+7,2))/99*255,
real(string_copy(str,II+9,2))/99*255,
real(string_copy(str,II+11,2))/99*255))
}
II+=13
}
else
{
symb=string_copy(str,II,1)
if symb='#'
{
Ys+=string_height('A')
Xs=0
}
else
{
draw_text(argument0+Xs,argument1+Ys,symb)
Xs+=string_width(symb)
}
}
}
draw_set_color(oldc)
}