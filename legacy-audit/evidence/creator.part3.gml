break;
case 89:break;
case 90:break;
case 91:
o=instance_create(24,160,field)
o.tu="P1"
o.T=2
o.b=1
o=instance_create(240,160,field)
o.tu="P2"
o.T=2
o.b=2
o=instance_create(24,240,field)
o.tu=lstr(6)
o.T=0
o.b=3
break;
case 92:
o=instance_create(24,160,field)
o.tu="P1"
o.T=11
o.b=1
o=instance_create(240,160,field)
o.tu="P2"
o.T=11
o.b=2
o=instance_create(24,240,field)
o.tu=lstr(199)
o.T=0
o.b=3
break;
case 93:break;
case 94:break;
case 95:
o=instance_create(24,160,field)
o.tu='Type'
o.T=28
o.b=1
o=instance_create(24,240,field)
o.tu=''
o.T=1
o.b=2
o.bb=1
o.mx=127
o.mn=0
o=instance_create(240,240,field)
o.tu=''
o.T=1
o.b=3
o.bb=1
o.mx=127
o.mn=0
break;
case 96:
o=instance_create(24,160,field)
o.tu='X'
o.T=1
o.b=1
o.bb=1
o.mx=127
o.mn=0
o=instance_create(240,160,field)
o.tu='Y'
o.T=1
o.b=2
o.bb=1
o.mx=127
o.mn=0
o=instance_create(456,160,field)
o.tu='R'
o.T=1
o.b=4
o.bb=1
o.mx=9
o.mn=0
o=instance_create(24,240,checkbox)
o.tu=ds_list_find_value(lp,0)
o.T=0
o=instance_create(160,240,checkbox)
o.tu=ds_list_find_value(lp,1)
o.T=1
o=instance_create(280,240,checkbox)
o.tu=ds_list_find_value(lp,2)
o.T=2
o=instance_create(400,240,checkbox)
o.tu=ds_list_find_value(lp,3)
o.T=3
o=instance_create(24,300,checkbox)
o.tu=ds_list_find_value(lp,4)
o.T=4
o=instance_create(160,300,checkbox)
o.tu=ds_list_find_value(lp,5)
o.T=5
o=instance_create(280,300,checkbox)
o.tu=ds_list_find_value(lp,6)
o.T=6
o=instance_create(400,300,checkbox)
o.tu=ds_list_find_value(lp,7)
o.T=7
if global.ret[3]=-1
global.ret[3]=0
break;
case 97:break;
case 98:
o=instance_create(24,160,field)
o.tu=lstr(223)
o.T=0
o.b=1
break;
case 99:
o=instance_create(24,160,field)
o.tu=lstr(9)
o.T=1
o.b=1
o.bb=1
o.mx=255
o.mn=0
o=instance_create(240,160,field)
o.tu=''
o.T=30
o.b=2
break;

case 100:
o=instance_create(24,160,field)
o.tu=''
o.T=1
o.b=1
o.bb=1
o.mx=52
o.mn=0
break;
case 101:
o=instance_create(24,160,field)
o.tu=''
o.T=1
o.b=1
o.bb=1
o.mx=16
o.mn=0
break;
case 102:
o=instance_create(24,160,field)
o.tu=''
o.T=1
o.b=1
o.bb=1
o.mx=16
o.mn=0
break;
case 103:
o=instance_create(24,160,field)
o.tu=''
o.T=1
o.b=1
o.bb=1
o.mx=255
o.mn=0
break;
case 104:break;
case 105:
o=instance_create(24,160,field)
o.tu=''
o.T=18
o.b=1
o.bb=4
break;
case 106:
o=instance_create(24,160,field)
o.tu=lstr(115)
o.T=11
o.b=1
o=instance_create(240,160,field)
o.tu=''
o.T=1
o.b=2
o.bb=1
o.mx=2
o.mn=1
break;
case 107:
o=instance_create(24,160,field)
o.tu='X'
o.T=1
o.b=1
o.bb=2
o.mx=4096
o.mn=0
o=instance_create(240,160,field)
o.tu='Y'
o.T=1
o.b=3
o.bb=2
o.mx=4096
o.mn=0
o=instance_create(24,240,field)
o.tu=lstr(225)
o.T=31
o.b=5
break;
case 108:
o=instance_create(24,240,field)
o.tu='Sound'
o.T=1
o.b=1
o.bb=2
o.mx=65535
o.mn=0
o=instance_create(24,160,field)
o.tu='X'
o.T=1
o.b=3
o.bb=1
o.mx=127
o.mn=0
o=instance_create(240,160,field)
o.tu='Y'
o.T=1
o.b=4
o.bb=1
o.mx=127
o.mn=0
break;
case 109:
o=instance_create(24,160,field)
o.tu=lstr(77)
o.T=9
o.b=1
o=instance_create(240,160,field)
o.tu='Player'
o.T=2
o.b=2
o=instance_create(24,240,field)
o.tu=lstr(9)
o.T=1
o.b=3
o.bb=1
o.mx=255
o.mn=0
break;
case 110:
o=instance_create(24,160,field)
o.tu=lstr(77)
o.T=9
o.b=1
o=instance_create(240,160,field)
o.tu='Player'
o.T=2
o.b=2
o=instance_create(24,240,field)
o.tu=lstr(9)
o.T=1
o.b=3
o.bb=1
o.mx=255
o.mn=0
break;
case 111:
o=instance_create(24,160,field)
o.tu=lstr(9)
o.T=1
o.b=1
o.bb=1
o.mx=255
o.mn=0
o=instance_create(240,160,field)
o.tu='Unit'
o.T=14
o.b=2
o=instance_create(24,240,field)
o.tu='Killer player'
o.T=2
o.b=3
o=instance_create(240,240,field)
o.tu='Target player'
o.T=2
o.b=4
break;
case 112:
o=instance_create(24,160,field)
o.tu=lstr(9)
o.T=1
o.b=1
o.bb=1
o.mx=255
o.mn=0
o=instance_create(240,160,field)
o.tu=lstr(9)
o.T=1
o.b=2
o.bb=1
o.mx=255
o.mn=0
break;
case 113:
o=instance_create(24,160,field)
o.tu='Type'
o.T=28
o.b=1
break;
case 114:break;
case 115:break;
case 116:
o=instance_create(24,160,field)
o.tu=""
o.T=1
o.b=1
o.bb=1
o.mx=255
o.mn=0
break;
case 117:
o=instance_create(24,160,field)
o.tu=lstr(28)
o.T=1
o.b=1
o.bb=1
o.mx=255
o.mn=0
o=instance_create(24,240,field)
o.tu=lstr(4)
o.T=33
o.b=2
o=instance_create(240,160,field)
o.tu='Player'
o.T=2
o.b=3
break;
case 118:
o=instance_create(24,160,field)
o.tu=lstr(9)
o.T=1
o.b=1
o.bb=1
o.mx=255
o.mn=0
o=instance_create(240,160,field)
o.tu=lstr(9)
o.T=1
o.b=2
o.bb=1
o.mx=255
o.mn=0
o=instance_create(24,240,field)
o.tu=lstr(42)
o.T=14
o.b=3
o=instance_create(240,240,field)
o.tu=lstr(39)
o.T=2
o.b=4
o=instance_create(456,240,field)
o.tu=lstr(9)
o.T=1
o.b=5
o.bb=1
o.mx=255
o.mn=0
break;
case 119:break;
case 120:
o=instance_create(240,160,field)
o.tu="Mission"
o.T=34
o.b=1
o.bb=511
break;
case 121:
o=instance_create(24,160,field)
o.tu=lstr(42)
o.T=14
o.b=1
o=instance_create(240,160,field)
o.tu="Name"
o.T=35
o.b=2
o.bb=47
break;
case 122:
o=instance_create(240,160,field)
o.tu="Text"
o.T=34
o.b=1
o.bb=511
break;
case 123:
o=instance_create(240,160,field)
o.tu="Title"
o.T=35
o.b=1
o.bb=47
break;
case 124:
o=instance_create(24,160,field)
o.tu=lstr(65)
o.T=1
o.b=1
o.bb=1
o.mx=255
o.mn=0
o=instance_create(24,240,field)
o.tu=lstr(256)
o.T=14
o.b=2
o=instance_create(240,240,field)
o.tu=lstr(257)
o.T=14
o.b=3
break;
case 125:break;
case 126:break;
case 127:break;
default:break;
}