b=7
break;
case 35:
t=lstr(39)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])+'%color[000000] '+lstr(50)
+' %color[555500]'+ds_list_find_value(lj,global.a[2])+'%color[000000] '+lstr(13)+' '
+'%color[006677]'+ds_list_find_value(ls,global.a[7])+'%color[000000] '+lstr(14)+' '
+'%color[000099]'+string(global.a[3]+256*global.a[4]+256*256*global.a[5]+256*256*256*global.a[6])+'%color[000000] '
+lstr(27)+' '+lstr(28)+'%color[990099]'+string(global.a[8])+ds_list_find_value(global.VARS,256+global.a[8])
i+=8
b=9
break;
case 36:
t=lstr(58)
b=1
break;
case 37:
t=lstr(59)+' "%color[000099]'
b=0
for (MI=0; MI<global.a[2]; MI+=1)
{
if global.a[3+MI]=10 t+="\n"
else
{
if global.a[3+MI]=3 t+="\x3"
else
{
if global.a[3+MI]=4 t+="\x4"
else
{
if global.a[3+MI]=5 t+="\x5"
else
{
if global.a[3+MI]=6 t+="\x6"
else
{
if global.a[3+MI]=13 t+="\x13"
else
{
if global.a[3+MI]!=0
t+=chr(global.a[3+MI])
}
}
}
}
}
}
b+=1
}
t+='%color[000000]" '+lstr(60)+' %color[990000]'+string(global.a[1])+'%color[000000] '+lstr(61)
b+=3
i+=b-1
break;
case 38:
t=lstr(62)+' %color[000099]'+string(global.a[1])
i+=1
b=2
break;
case 39:
t=lstr(63)+' %color[990000]'+ds_list_find_value(lu,global.a[2])+'%color[000000] '+lstr(64)
+' %color[005555]'+ds_list_find_value(lu,global.a[3])+'%color[000000] '
+'('+lstr(65)+' %color[000099]'+string(global.a[1])+'%color[000000])'
i+=3
b=4
break;
case 40:
t=lstr(66)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 41:
t=lstr(67)
b=1
break;
case 42:
t=''
if global.a[1]=0
{
t+=lstr(68)+' '
if global.a[2]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
}
if global.a[1]=1
{
t+=lstr(69)+' '
if global.a[2]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
}
if global.a[1]=2
{
t+=lstr(70)+' '
if global.a[2]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
}
if global.a[1]=3
{
t+=lstr(71)+' '
if global.a[2]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
}
if global.a[1]=4
{
t+=lstr(72)+' '
if global.a[2]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
}
if global.a[1]=5
{
t+=lstr(73)+' %color[000099]'+string(global.a[2])
}
if global.a[1]=6
{
t+=lstr(74)+' %color[000099]'+string(global.a[2])
}
if global.a[1]=7
{
t+=lstr(75)+' '
if global.a[2]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
}
if global.a[1]=8
{
t+=lstr(76)+' '
if global.a[2]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
}
i+=2
b=3
break;
case 43:
t=lstr(77)+' %color[990000]'+ds_list_find_value(ld,global.a[1])+'%color[000000] '
+lstr(78)+' %color[000099]'+string(global.a[2])
i+=2
b=3
break;
case 44:
t=lstr(79)+'%color[990099]'+string(global.a[1])
+'%color[000000] = %color[000099]'+string(global.a[2])+'%color[000000] '
+lstr(27)+' '+lstr(28)+'%color[990099]'+string(global.a[3])+ds_list_find_value(global.VARS,256+global.a[3])
i+=3
b=4
break;
case 45:
t=lstr(80)+' '
if global.a[1]=8
t+=ds_list_find_value(lcol,17)+ds_list_find_value(lp,17)
else
t+=ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])
t+='%color[000000] '+lstr(27)+' '
+lstr(28)+'%color[990099]'+string(global.a[2])+ds_list_find_value(global.VARS,256+global.a[2])
i+=2
b=3
break;
case 46:
t=lstr(81)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 47: 
t=lstr(82)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])
+' '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])+'%color[000000] '+lstr(83)+' '
+lstr(27)+' '+lstr(28)+'%color[990099]'+string(global.a[3])+ds_list_find_value(global.VARS,256+global.a[3])
i+=3
b=4
break;
case 48:
t=lstr(84)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 49:
t=lstr(85)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 50:
t=lstr(86)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 51:
t=lstr(87)
b=1
break;
case 52:
t=lstr(88)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 53:
t=lstr(89)
b=1
break;
case 54:
t=lstr(90)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 55:
t=lstr(91)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 56:
t=lstr(92)
b=1
break;
case 57:
t=lstr(93)
b=1
break;
case 58:
var hslot;
{
hslot=global.a[1]
t=lstr(94)+' %color[990000]'+ds_list_find_value(lu,global.a[2])+'%color[000000] '+lstr(95)+' '
if hslot<8
t+='%color[000099]'+string(hslot)+'%color[000000] '+lstr(96)
else
t+='%color[000099]'+string(hslot-8)+'%color[000000] '+lstr(97)
}
i+=2
b=3
break;
case 59:
t=lstr(98)
b=1
break;
case 60:
t=lstr(99)
b=1
break;
case 61:
t=lstr(100)+' = %color[990000]'+string(global.a[1])
i+=1
b=2
break;
case 62:
t=lstr(101)+' %color[990000]'+ds_list_find_value(lb,global.a[1])
+'%color[000000] = %color[000099]'+string(global.a[2]+256*global.a[3])
i+=3
b=4
break;
case 63:
t=lstr(102)
b=1
break;
case 64:
t=lstr(103)
b=1
break;
case 65:
t=lstr(104)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 66:
t=lstr(105)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 67:
t=lstr(106)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 68:
t=lstr(107)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 69:
t=lstr(108)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 70:
t=lstr(109)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 71:
t=lstr(110)
b=1
break;
case 72:
t=lstr(111)+' '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])+'%color[000000] '
+lstr(27)+' '+lstr(28)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,256+global.a[1])
i+=2
b=3
break;
case 73:
var tT;
{
tT='0'
if global.a[2]=0
tT=ds_list_find_value(latu,global.a[3])
if global.a[2]=1
tT=ds_list_find_value(latp,global.a[3])
if global.a[2]=2 or global.a[2]=3
tT=ds_list_find_value(lats,global.a[3])
t=lstr(39)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])+'%color[000000] '
+lstr(112)+' %color[004444]'+ds_list_find_value(lat,global.a[2])+'%color[000000] '+lstr(113)
+' %color[444400]'+string(tT)+'%color[000000] '+lstr(114)+' '
if global.a[4]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
}
i+=4
b=5
break;
case 74:
t=lstr(115)+' '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])+'%color[000000] '+lstr(116)+' '+lstr(115)+' '
+ds_list_find_value(lcol,global.a[3])+ds_list_find_value(lp,global.a[3])+'%color[000000] '
+'('+lstr(65)+' %color[000099]'+string(global.a[1])+'%color[000000])'
i+=3
b=4
break;
case 75:
t=lstr(117)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 76:
t=lstr(118)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 77:
t=lstr(119)
b=1
break;
case 78:
t=lstr(120)
b=1
break;
case 79:
t=lstr(121)
b=1
break;
case 80:
t=lstr(122)
b=1
break;
case 81:
t=lstr(123)+' %color[990000]'+ds_list_find_value(lu,global.a[2])+'%color[000000] '+lstr(124)+' '
+'('+lstr(65)+' %color[000099]'+string(global.a[1])+'%color[000000])'
i+=2
b=3
break;
case 82:
t=lstr(123)+' %color[990000]'+ds_list_find_value(lu,global.a[2])+'%color[000000] '+lstr(125)+' '
+'('+lstr(65)+' %color[000099]'+string(global.a[1])+'%color[000000])'
i+=2
b=3
break;
case 83:
t=lstr(123)+' %color[990000]'+ds_list_find_value(lu,global.a[2])+'%color[000000] '+lstr(126)+' '
+'('+lstr(65)+' %color[000099]'+string(global.a[1])+'%color[000000])'
i+=2
b=3
break;
case 84:
t=lstr(123)+' %color[990000]'+ds_list_find_value(lu,global.a[2])+'%color[000000] '+lstr(127)+' '
+'('+lstr(65)+' %color[000099]'+string(global.a[1])+'%color[000000])'
i+=2
b=3
break;
case 85:
t=lstr(123)+' %color[990000]'+ds_list_find_value(lu,global.a[2])+'%color[000000] '+lstr(128)+' '
+'('+lstr(65)+' %color[000099]'+string(global.a[1])+'%color[000000])'
i+=2