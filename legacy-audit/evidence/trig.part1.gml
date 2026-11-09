t=''
switch (global.a[0])
{
case -1: 
t=lstr(140)
b=1
case 0: 
i=65536
break;
case 1: 
t=lstr(2)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 2:
t=lstr(3)+' %color[000099]'+string(global.a[1])
i+=1
b=2
break;
case 3: 
t=lstr(4)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])
+' %color[000000]& '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])
+' %color[000000]'+lstr(5)+' '
if global.a[3]=1
t+='%color[009900]'+lstr(6)
else
t+='%color[990000]'+lstr(7)
i+=3
b=4
break;
case 4: 
t=lstr(4)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])
+' %color[000000]& '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])
+' %color[000000]'+lstr(8)+' '
if global.a[3]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=3
b=4
break;
case 5: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])+" %color[000000]= %color[000099]"+string(global.a[2])
i+=2
b=3
break;
case 6: 
if global.a[1]=0
{
t=lstr(10)+" %color[000099]"+ds_list_find_value(lu,global.a[2])
b=3
}
if global.a[1]=1
{
t=lstr(11)
b=2
}
var tT
{
tT=string(global.a[3]+256*global.a[4])
switch (global.a[2])
{
case 44:
tT=ds_list_find_value(lp,global.a[3])
break;
case 37:
case 39:
case 43:
tT=ds_list_find_value(lu,global.a[3])
break;
case 42:
tT=ds_list_find_value(lmt,global.a[3])
break;
case 46:
case 47:
tT=ds_list_find_value(lor,global.a[3])
break;
case 45:
if global.a[3]<8
{
tT=ds_list_find_value(lcol,global.a[3])+ds_list_find_value(lp,global.a[3])
}
break;
default:
tT=string(global.a[3]+256*global.a[4])
break;
}
if global.a[1]=2
{
t=lstr(12)+" %color[990000]"+ds_list_find_value(lg,global.a[2])+' %color[000000]'
+lstr(13)+' %color[990099]'+ds_list_find_value(ls,global.a[5])+' %color[000000]'+lstr(14)
+" %color[000099]"+tT
b=6
}
if global.a[1]=3
{
t=lstr(15)+' %color[990000]'+ds_list_find_value(lg,global.a[2])
+"%color[000000] = %color[000099]"+tT
b=5
}
}
if global.a[1]=4
{
t=lstr(16)
b=2
}
if global.a[1]=5
{
t=lstr(17)
b=2
}
if global.a[1]=6
{
t=lstr(18)+' %color[000099]'+string(global.a[2])+'%color[000000] HP'
b=3
}
if global.a[1]=7
{
t=lstr(19)
b=2
}
if global.a[1]=8
{
t=lstr(20)+' %color[000099]'+string(global.a[2])+' '+string(global.a[3])
b=4
}
if global.a[1]=9
{
t=lstr(21)+' '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])
b=3
}
if global.a[1]=10
{
t=lstr(22)+' %color[000099]'+string(global.a[2]+256*global.a[3])
b=4
}
if global.a[1]=11
{
t=lstr(194)
b=2
}
if global.a[1]=12
{
t=lstr(204)+' %color[990000]'+ds_list_find_value(lor,global.a[2])
+' %color[000000]'+lstr(113)+' %color[000099]'+string(global.a[3])+' '+string(global.a[4])
b=5
}
if global.a[1]=13
{
t=lstr(216)+' %color[000099]'+string(global.a[2]+256*global.a[3])+'%color[000000] HP'
b=4
}
if global.a[1]=14
{
t=lstr(217)
b=2
}
if global.a[1]=15
{
t=lstr(218)+' %color[000099]'+ds_list_find_value(lpr,global.a[2])
b=3
}
if global.a[1]=16
{
t=lstr(219)+' %color[000099]'+ds_list_find_value(lpr,global.a[2])
b=3
}
if global.a[1]=17
{
t=lstr(220)+' %color[000099]'+ds_list_find_value(lpr,global.a[2])
b=3
}
if global.a[1]=18
{
t=lstr(222)+' %color[000099]'+string(global.a[3])
+' %color[000000]'+lstr(214)+' '
for (j=0; j<8; j+=1)
{
if global.a[2]&(1<<j)!=0
t+=ds_list_find_value(lcol,j)+ds_list_find_value(lp,j)+" "
}
b=4
}
if global.a[1]=19
{
t=lstr(221)+' %color[000099]'+string(global.a[2])
b=3
}
if global.a[1]=20
{
t=lstr(226)+' %color[000099]'+ds_list_find_value(lbl,global.a[2])+' %color[000000]'+lstr(228)
b=3
}
if global.a[1]=21
{
t=lstr(229)+' %color[000099]'+ds_list_find_value(lbl,global.a[2])+' %color[000000]'+lstr(230)
b=3
}
if global.a[1]=22
{
t=lstr(12)+" %color[990000]"+ds_list_find_value(lg,global.a[2])+' %color[000000]'
+lstr(13)+' %color[990099]'+ds_list_find_value(ls,global.a[4])+' %color[000000]'+lstr(14)
+' '+lstr(9)+'%color[990099]'+string(global.a[3])+ds_list_find_value(global.VARS,global.a[3])
b=5
}
if global.a[1]=23
{
t=lstr(227)+' %color[990099]'+string(global.a[2]+256*global.a[3])+' %color[000000]'+lstr(241)
b=4
}
if global.a[1]=24
{
t=lstr(232)
if global.a[3]=1
t+='%color[009900]'+lstr(235)
else
t+='%color[990000]'+lstr(234)
t+=" %color[000000]"+lstr(233)+' '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])
b=4
}
if global.a[1]=25
{
t=lstr(216)+' %color[000099]'+string(global.a[2]+256*global.a[3])+'%color[000000] HP '+lstr(240)
+' '+ds_list_find_value(lcol,global.a[4])+ds_list_find_value(lp,global.a[4])
b=5
}
if global.a[1]=26
{
t=lstr(242)
b=2
}
if global.a[1]=27
{
t=lstr(20)
+' %color[000099]'+lstr(9)+'%color[990099]'+string(global.a[2])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000099]'+lstr(9)+'%color[990099]'+string(global.a[3])+ds_list_find_value(global.VARS,global.a[2])
b=4
}
i+=b-1
break;
case 7:
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])+' %color[000000] = sum of parameters:#'
if global.a[3]&1!=0
{
t+=lstr(23)+' %color[666600]'+ds_list_find_value(lr,global.a[4])+" %color[000000]"+lstr(24)+' '
+ds_list_find_value(lcol,15)+ds_list_find_value(lp,15)+' %color[000000]'+lstr(4)+'#'
}
if global.a[3]&2!=0 and global.a[2]=0
{
t+=lstr(23)+' %color[666600]'+ds_list_find_value(lr,global.a[4])+" %color[000000]"+lstr(24)+' '
+ds_list_find_value(lcol,16)+ds_list_find_value(lp,16)+' %color[000000]'+lstr(4)+'#'
}
if global.a[2]!=0
{
t+=lstr(23)+' %color[666600]'+ds_list_find_value(lr,global.a[4])+" %color[000000]"+lstr(24)+' '
if global.a[3]&2=0
{
for (j=0; j<8; j+=1)
{
if global.a[2]&(1<<j)!=0
t+=ds_list_find_value(lcol,j)+ds_list_find_value(lp,j)+" "
}
t+='%color[000000]'+lstr(4)
}
else
{
for (j=0; j<8; j+=1)
{
if global.a[2]&(1<<j)!=0
t+=ds_list_find_value(lcol,j)+ds_list_find_value(lp,j)+" "
}
t+='%color[000000]'+lstr(4)+' '+lstr(25)+' '+ds_list_find_value(lcol,16)+ds_list_find_value(lp,16)
}
}
i+=4
b=5
break;
case 8: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])+' %color[000000]'+lstr(13)+' '
+'%color[990000]'+ds_list_find_value(ls,global.a[2])+' %color[000000]'+lstr(26)+' '
+lstr(9)+'%color[990099]'+string(global.a[3])+ds_list_find_value(global.VARS,global.a[3])+' %color[000000]'+lstr(27)+' '
+lstr(28)+'%color[990099]'+string(global.a[4])+ds_list_find_value(global.VARS,256+global.a[4])
i+=4
b=5
break;
case 9:
t=lstr(29)+' %color[000099]'+string(global.a[1])+' '+string(global.a[2])+' '+string(global.a[3])+' '+string(global.a[4])
i+=4
b=5
break;
case 10: 
t=lstr(30)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 11: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000000]'+lstr(32)+' '+lstr(31)+'%color[000099]'+string(global.a[2])
i+=2
b=3
break;
case 12: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000000]'+lstr(33)+' '+lstr(31)+'%color[000099]'+string(global.a[2])
i+=2
b=3
break;
case 13: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000000]'+lstr(34)+' '+lstr(9)+'%color[990099]'+string(global.a[2])+ds_list_find_value(global.VARS,global.a[2])
i+=2
b=3
break;
case 14: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000000]'+lstr(35)+' '+lstr(9)+'%color[990099]'+string(global.a[2])+ds_list_find_value(global.VARS,global.a[2])
i+=2
b=3
break;
case 15: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000000]'+lstr(36)+' '+lstr(9)+'%color[990099]'+string(global.a[2])+ds_list_find_value(global.VARS,global.a[2])
i+=2
b=3
break;
case 16: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000000]'+lstr(37)+' '+lstr(9)+'%color[990099]'+string(global.a[2])+ds_list_find_value(global.VARS,global.a[2])
i+=2
b=3
break;
case 17: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000000]'+lstr(38)+' '+lstr(9)+'%color[990099]'+string(global.a[2])+ds_list_find_value(global.VARS,global.a[2])
i+=2
b=3
break;
case 18: 
t=lstr(39)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])
+' %color[000000]'+lstr(40)+' %color[000099]'+ds_list_find_value(lu,global.a[2])+' %color[000000]'
+lstr(41)+' %color[004499]'+ds_list_find_value(lu,global.a[3])
i+=3
b=4
break;
case 19: 
t=lstr(39)+' '+ds_list_find_value(lcol,global.a[4])+ds_list_find_value(lp,global.a[4])
+' %color[000000]'+lstr(42)+' %color[005599]'+ds_list_find_value(lu,global.a[3])+' %color[000000]'
+lstr(43)+' %color[000099]'+string(global.a[1])+' '+string(global.a[2])+' %color[000000]'+lstr(44)
+' '+lstr(9)+'%color[990099]'+string(global.a[5])+ds_list_find_value(global.VARS,global.a[5])
i+=5
b=6
break;
case 20: 
t=lstr(39)+' '+ds_list_find_value(lcol,global.a[4])+ds_list_find_value(lp,global.a[4])
+' %color[000000]'+lstr(42)+' %color[005599]'+ds_list_find_value(lu,global.a[3])+' %color[000000]'
+lstr(43)+' %color[000099]'+string(global.a[1])+' '+string(global.a[2])+' %color[000000]'+lstr(44)+' %color[990000]'+string(global.a[5])
i+=5
b=6
break;
case 21: 
t=lstr(45)+' '+lstr(28)+'%color[000099]'+string(global.a[1])+ds_list_find_value(global.VARS,256+global.a[1])
+' %color[000000]'
if global.a[2]=1
t+='%color[009900]'+lstr(46)
else
t+='%color[990000]'+lstr(47)
i+=2
b=3
break;
case 22:
t='IF '+lstr(28)+'%color[000099]'+string(global.a[1])+ds_list_find_value(global.VARS,256+global.a[1])
+'%color[000000] = %color[009900]'+lstr(46)
i+=1
b=2
eif=1
break;
case 23:
t='end IF'
b=1
eif=2
break;
case 24:
t='%color[009900]'+lstr(48)
b=1
break;
case 25:
t='%color[990000]'+lstr(49)
b=1
break;
case 26:
t=lstr(39)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])
+' %color[000000]'+lstr(50)+' %color[000099]'+ds_list_find_value(lj,global.a[2])+'%color[000000]'
if global.a[2]<3
t+=' %color[009900]'+lstr(34)+' '
else
t+=' %color[990000]'+lstr(35)+' '
t+='%color[003344]'+string(global.a[3])+'%color[000000]*'+lstr(9)+'%color[990099]'+string(global.a[4])
+ds_list_find_value(global.VARS,global.a[4])
i+=4
b=5
break;
case 27:
t=lstr(51)
b=1
break;
case 28:
t=lstr(52)
b=1
break;
case 29:
t=lstr(53)
b=1
break;
case 30: 
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+'%color[000000] = '+lstr(54)
i+=1
b=2
break;
case 31: 
t=lstr(55)+' %color[990000]'+ds_list_find_value(lm,global.a[1])
+'%color[000000] = %color[111155]'+string(global.a[2])+' %color[000000]'+lstr(56)
i+=2
b=3
break;
case 32:
t=lstr(57)+' %color[000099]'+string(global.a[1])+' '+string(global.a[2])
i+=2
b=3
break;
case 33:
t='IF '+lstr(28)+'%color[000099]'+string(global.a[1])+ds_list_find_value(global.VARS,256+global.a[1])
+'%color[000000] = %color[990000]'+lstr(47)
i+=1
b=2
eif=1
break;
case 34:
t=lstr(39)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])+'%color[000000] '+lstr(50)
+' %color[555500]'+ds_list_find_value(lj,global.a[2])+' %color[000000]= '
+'%color[000099]'+string(global.a[3]+256*global.a[4]+256*256*global.a[5]+256*256*256*global.a[6])
i+=6