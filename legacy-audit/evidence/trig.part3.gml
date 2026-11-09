b=3
break;
case 86:
t=lstr(123)+' %color[990000]'+ds_list_find_value(lu,global.a[2])+'%color[000000] '+lstr(129)+' '
+'('+lstr(65)+' %color[000099]'+string(global.a[1])+'%color[000000])'
i+=2
b=3
break;
case 87:
t=lstr(130)
b=1
break;
case 88:
t=lstr(187)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 89:
t=lstr(193)
b=1
break;
case 90:
t=lstr(197)
b=1
break;
case 91: 
t=lstr(115)+' '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])
+' %color[000000]'+lstr(198)+' '
if global.a[3]=1
t+='%color[009900]'+lstr(200)
else
t+='%color[990000]'+lstr(201)
t+=' %color[000000]'+lstr(39)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])
i+=3
b=4
break;
case 92: 
t=lstr(115)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])
+' %color[000000]'+lstr(199)+' '
if global.a[3]=1
t+='%color[009900]'+lstr(200)
else
t+='%color[990000]'+lstr(201)
t+=' %color[000000]'+lstr(39)+' '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])
i+=3
b=4
break;
case 93:
t=lstr(207)
b=1
break;
case 94:
t=lstr(208)
b=1
break;
case 95:
t=lstr(209)+' %color[990000]'+ds_list_find_value(ltt,global.a[1])
+' %color[000000]'+lstr(210)+' %color[000099]'+string(global.a[2])+' '+string(global.a[3])
i+=3
b=4
break;
case 96:
t=lstr(212)+' %color[000099]'+string(global.a[1])+' '+string(global.a[2])
+' %color[000000]'+lstr(213)+' %color[990000]'+string(global.a[4])
+' %color[000000]'+lstr(214)+' '
for (j=0; j<8; j+=1)
{
if global.a[3]&(1<<j)!=0
t+=ds_list_find_value(lcol,j)+ds_list_find_value(lp,j)+" "
}
i+=4
b=5
break;
case 97:
t=lstr(215)
b=1
break;
case 98: 
t=lstr(223)+' '
if global.a[1]=1
t+='%color[009900]'+lstr(1)
else
t+='%color[990000]'+lstr(0)
i+=1
b=2
break;
case 99:
t=lstr(9)+' %color[990000]'+string(global.a[1])
+' %color[000000]= %color[000099]'+ds_list_find_value(lg,global.a[2])
+' %color[000000]'+lstr(224)
i+=2
b=3
break;

case 100:
t="Briefing ID: %color[000099]"+string(global.a[1])
i+=1
b=2
break;
case 101:
t="Victory + video ID: %color[000099]"+string(global.a[1])
i+=1
b=2
break;
case 102:
t="Defeat + video ID: %color[000099]"+string(global.a[1])
i+=1
b=2
break;
case 103:
t="Trigger restart time = %color[990000]"+string(global.a[1])
i+=1
b=2
break;
case 104:
t=lstr(131)
b=1
break;
case 105:
t=lstr(132)+' %color[990000]'
+string(global.a[1]+256*global.a[2]+256*256*global.a[3]+256*256*256*global.a[4])
i+=4
b=5
break;
case 106:
t=lstr(115)+' '+ds_list_find_value(lcol,global.a[1])+ds_list_find_value(lp,global.a[1])
+'%color[000000] '+lstr(133)+' %color[000099]'
if global.a[2]=1
t+="Human"
if global.a[2]=2
t+="Orc"
i+=2
b=3
break;
case 107:
t=lstr(226)+'%color[990000] '+ds_list_find_value(lbl,global.a[5])
+'%color[000000] '+lstr(210)+' %color[000099]'+string(global.a[1]+256*global.a[2])
+' '+string(global.a[3]+256*global.a[4])
i+=5
b=6
break;
case 108:
t=lstr(227)+'%color[990000] '+string(global.a[1]+256*global.a[2])
+'%color[000000] '+lstr(210)+' %color[000099]'+string(global.a[3])+' '+string(global.a[4])
i+=4
b=5
break;
case 109:
t=lstr(39)+' '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])
+' %color[000000]'+lstr(236)+' %color[000099]'+ds_list_find_value(ld,global.a[1])
+' %color[000000]= '+lstr(9)+'%color[990099]'+string(global.a[3])+ds_list_find_value(global.VARS,global.a[3])
i+=3
b=4
break;
case 110:
t=lstr(9)+'%color[990099]'+string(global.a[3])+ds_list_find_value(global.VARS,global.a[3])+' %color[000000]= '
+lstr(236)+' %color[000099]'+ds_list_find_value(ld,global.a[1])+' %color[000000]'
+lstr(237)+' '+ds_list_find_value(lcol,global.a[2])+ds_list_find_value(lp,global.a[2])
i+=3
b=4
break;
case 111:
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000000]= '+lstr(238)
+' %color[000099]'+ds_list_find_value(lu,global.a[2])
+' %color[000000]'+lstr(239)
+' '+ds_list_find_value(lcol,global.a[4])+ds_list_find_value(lp,global.a[4])
+' %color[000000]'+lstr(240)
+' '+ds_list_find_value(lcol,global.a[3])+ds_list_find_value(lp,global.a[3])
i+=4
b=5
break;
case 112:
t=lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])+' %color[000099]= '
+lstr(243)+' %color[000000]#'
+lstr(9)+'%color[990099]'+string(global.a[2])+ds_list_find_value(global.VARS,global.a[2])+' %color[000099]= '
+lstr(244)
i+=2
b=3
break;
case 113:
t=lstr(209)+' %color[990000]'+ds_list_find_value(ltt,global.a[1])
+' %color[000000]'+lstr(245)
i+=1
b=2
break;
case 114:
t=lstr(246)
b=1
break;
case 115:
t=lstr(247)
b=1
break;
case 116:
t=lstr(249)+' %color[990000]'+string(10*global.a[1])
i+=1
b=2
break;
case 117:
t=lstr(250)+' '+ds_list_find_value(lcol,global.a[3])+ds_list_find_value(lp,global.a[3])
+' %color[000099]'+ds_list_find_value(lcont,global.a[2])+' %color[000000]'
+lstr(27)+' '+lstr(28)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,256+global.a[1])
i+=3
b=4
break;
case 118: 
t=lstr(39)+' '+ds_list_find_value(lcol,global.a[4])+ds_list_find_value(lp,global.a[4])
+' %color[000000]'+lstr(42)+' %color[005599]'+ds_list_find_value(lu,global.a[3])+' %color[000000]'
+lstr(43)
+' %color[000099]'+lstr(9)+'%color[990099]'+string(global.a[1])+ds_list_find_value(global.VARS,global.a[1])
+' %color[000099]'+lstr(9)+'%color[990099]'+string(global.a[2])+ds_list_find_value(global.VARS,global.a[2])
+' %color[000000]'+lstr(44)
+' '+lstr(9)+'%color[990099]'+string(global.a[5])+ds_list_find_value(global.VARS,global.a[5])
i+=5
b=6
break;
case 119:
t=lstr(248)
b=1
break;
case 120:
t=lstr(251)+' %color[000099]'
b=0
for (MI=0; MI<(global.a[1]+256*global.a[2]); MI+=1)
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
b+=3
i+=b-1
break;
case 121:
t=lstr(252)+' %color[005599]'+ds_list_find_value(lu,global.a[1])+' %color[000000]'
+lstr(253)+' %color[000099]'
b=0
for (MI=0; MI<(global.a[2]+256*global.a[3]); MI+=1)
{
if global.a[4+MI]=10 t+="\n"
else
{
if global.a[4+MI]=3 t+="\x3"
else
{
if global.a[4+MI]=4 t+="\x4"
else
{
if global.a[4+MI]=5 t+="\x5"
else
{
if global.a[4+MI]=6 t+="\x6"
else
{
if global.a[4+MI]=13 t+="\x13"
else
{
if global.a[4+MI]!=0
t+=chr(global.a[4+MI])
}
}
}
}
}
}
b+=1
}
b+=4
i+=b-1
break;
case 122:
t=lstr(254)+' %color[000099]'
b=0
for (MI=0; MI<(global.a[1]+256*global.a[2]); MI+=1)
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
b+=3
i+=b-1
break;
case 123:
t=lstr(255)+' %color[000099]'
b=0
for (MI=0; MI<(global.a[1]+256*global.a[2]); MI+=1)
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
b+=3
i+=b-1
break;
case 124:
t=lstr(258)+' %color[990000]'+ds_list_find_value(lu,global.a[2])+'%color[000000] '+lstr(259)
+' %color[005555]'+ds_list_find_value(lu,global.a[3])+'%color[000000] '
+'('+lstr(65)+' %color[000099]'+string(global.a[1])+'%color[000000])'
i+=3
b=4
break;
case 125:
t=lstr(261)+' 1 + %color[990099]'+lstr(9)+"0"+ds_list_find_value(global.VARS,0)+' %color[000000]'+lstr(262)
b=1
erp=1
break;
case 126:
if erp=1
{
t=lstr(260)
erp=2
}
else t=lstr(263)
b=1
break;
case 127:
t=lstr(264)
b=1
break;

case 254://FE
if global.a[1]=237//ED
{
t="END"
xx=0
}
else
{
if global.a[1]=255//FF (legacy end)
{
t="END (legacy)"
xx=0
}
else
t="%color[990000]FATAL ERROR (END)"
}
i+=1
b=2
break;
default:
if string(global.a[0])='ERROR'
t="%color[990000]FATAL ERROR (UNKNOWN)"
else
t="%color[990000]FATAL ERROR "+string(global.a[0])
b=1
break;
}