'use strict';

var mysql = require('mysql');
require('dotenv').config();

function connection() {
  var con = mysql.createConnection({
    //deployment code
    // host     : process.env.RDS_HOSTNAME,
    // user     : process.env.RDS_USERNAME,
    // password : process.env.RDS_PASSWORD,
    // port     : process.env.RDS_PORT,
    // database : process.env.DB_SCHEMA

    //testing code
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA
  });
  return con;
}

function checkRestaurant(id, callback) { //Look up callback and asynchronous call with javascript
  var con = connection();
  con.connect(function (err) {
    if (err) {
      console.log('Database connection failed: ' + err.stack);
      return callback(err, null);
    }
    con.query("SELECT COUNT(*) AS rowNum FROM tblRestaurant WHERE yelpID = ?", [id], function (err, result, fields) {
      if (err) {
        console.log("CheckRestaurant SQL failed\n");
        con.end();
        return callback(err, null);
      }
      con.end();
      console.log('Returning result');
      console.log(result);
      if (result[0].rowNum > 0) {
        console.log('true')
        return callback(null, true);
      }
      else {
        return callback(null, false);
      }
    })
  })
}

function insertRestaurant(yelpID, restName, alias, address, city, state, zipCode, latitude, longitude, phoneNum, yelpURL, callback) {
  var con = connection();
  con.connect(function (err) {
    if (err) {
      console.log('Database connection failed: ' + err.stack);
      return callback(err);
    }
    // var sql = "INSERT INTO tblRestaurant (yelpID, restName, alias, address, city, state, zipCode, latitude, longitude, phoneNum, yelpURL) VALUES (\'" 
    //           + yelpID + "\', \'" + restName + "\', \'" + alias + "\', \'" + address + "\', \'" + city + "\', \'" + state + "\', \'" 
    //           + zipCode + "\', \'" + latitude + "\', \'" + longitude + "\', \'" + phoneNum + "\', \'" + yelpURL + "\')";
    con.query("INSERT INTO tblRestaurant (yelpID, restName, alias, address, city, state, zipCode, latitude, longitude, phoneNum, yelpURL) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [yelpID.toString(), restName.toString(), alias.toString(), address.toString(), city.toString(), state.toString(), zipCode, latitude, longitude, phoneNum.toString(), yelpURL.toString()], function (err, result) {
        if (err) {
          console.log("insertRestaurant SQL failed\n");
          con.end();
          return callback(err);
        }
      })
    con.end();
    return callback(null);
  })
}

function getRestaurantID(yelpID, callback) {
  var con = connection();
  con.connect(function (err) {
    if (err) {
      console.log('Database connection failed: ' + err.stack);
      return callback(err, null);
    }

    //var sql = "SELECT restID FROM tblRestaurant WHERE yelpID = \'" + yelpID + "\'";
    con.query("SELECT restID FROM tblRestaurant WHERE yelpID = ?", [yelpID], function (err, result) {
      if (err) {
        console.log("getRestaurantID SQL failed");
        con.end();
        return callback(err, null);
      }
      con.end();
      if (result.length < 1) {
        //console.log("yelpID: " + yelpID + " not found");
        var error = { messsage: "yelpID: " + yelpID + " not found" };
        return callback(error, null);
      }
      console.log(result);
      var id = result[0].restID;
      return callback(null, id);
    })

  })
}

// function getReviewCount(restID, callback){
//   var con = connection();
//   con.connect(function(err){
//     if(err){
//       console.log('Database connection failed: ' + err.stack);  
//       return callback(err);
//       //throw err;
//     }
//     var sql = "SELECT COUNT(*) AS count FROM tblReview WHERE restID = " + restID;
//     con.query(sql, function (err, result){
//       if(err){
//         console.log("getReviewCount failed");
//         con.end(); 
//         return callback(err, null);
//       }
//       con.end();
//       var count = result[0].count;
//       return callback(null, count);
//     })

//   })
// }

function getRatingSumAndCount(restID, callback) {
  var con = connection();
  con.connect(function (err) {
    if (err) {
      console.log('Database connection failed: ' + err.stack);
      return callback(err, null, null);
    }
    //var sql = "SELECT COUNT(*) AS count, SUM(rating) AS sum FROM tblReview WHERE restID = " + restID;

    con.query("SELECT COUNT(*) AS count, SUM(rating) AS sum FROM tblReview WHERE restID = ?", [restID], function (err, result) {
      if (err) {
        console.log("getRating SQL failed");
        con.end();
        return callback(err, null, null);
      }
      con.end();
      var count = result[0].count;
      var sum = result[0].sum;
      return callback(null, count, sum);
    })
  })
}

function getRestaurantInfoByAlias(alias, callback) {
  var con = connection();
  con.connect(function (err) {
    if (err) {
      console.log('Database connection failed: ' + err.stack);
      return callback(err, null, null);
    }

    //var sql = "SELECT * FROM tblRestaurant WHERE alias = \'" + alias + "\'";
    con.query("SELECT * FROM tblRestaurant WHERE alias = ?", [alias], function (err, result) {
      con.end();
      if (err) {
        console.log("getRestaurantInfoByAlias SQL failed");
        return callback(err, null);
      }
      if (result.length < 1) {
        console.log("alias " + alias + " not found");
        var error = {
          messsage: "alias " + alias + " not found"
        };
        return callback(error, null);
      }
      return callback(null, result[0]);
    })
  })
}

function insertReview(restID, userID, description, rating, callback) {
  var con = connection();
  con.connect(function (err) {
    if (err) {
      console.log('Database connection failed: ' + err.stack);
      return callback(err);
    }

    var Filter = require('bad-words'),
        filter = new Filter();

    var moreWords = ['2 girls 1 cup','2g1c','4r5e','5h1t','5hit','a$$','a$$hole','a_s_s','a2m','a54','a55','a55hole','acrotomophilia','aeolus','ahole','alabama hot pocket','alaskan pipeline','anal','anal impaler','anal leakage','analprobe','anilingus','anus','apeshit','ar5e','areola','areole','arian','arrse','arse','arsehole','aryan','ass','ass fuck','ass fuck','ass hole','assbag','assbandit','assbang','assbanged','assbanger','assbangs','assbite','assclown','asscock','asscracker','asses','assface','assfaces','assfuck','assfucker','ass-fucker','assfukka','assgoblin','assh0le','asshat','ass-hat','asshead','assho1e','asshole','assholes','asshopper','ass-jabber','assjacker','asslick','asslicker','assmaster','assmonkey','assmucus','assmucus','assmunch','assmuncher','assnigger','asspirate','ass-pirate','assshit','assshole','asssucker','asswad','asswhole','asswipe','asswipes','auto erotic','autoerotic','axwound','azazel','azz','b!tch','b00bs','b17ch','b1tch','babeland','baby batter','baby juice','ball gag','ball gravy','ball kicking','ball licking','ball sack','ball sucking','ballbag','balls','ballsack','bampot','bang (one\'s) box','bangbros','bareback','barely legal','barenaked','barf','bastard','bastardo','bastards','bastinado','batty boy','bawdy','bbw','bdsm','beaner','beaners','beardedclam','beastial','beastiality','beatch','beaver','beaver cleaver','beaver lips','beef curtain','beef curtain','beef curtains','beeyotch','bellend','bender','beotch','bescumber','bestial','bestiality','bi+ch','biatch','big black','big breasts','big knockers','big tits','bigtits','bimbo','bimbos','bint','birdlock','bitch','bitch tit','bitch tit','bitchass','bitched','bitcher','bitchers','bitches','bitchin','bitching','bitchtits','bitchy','black cock','blonde action','blonde on blonde action','bloodclaat','bloody','bloody hell','blow job','blow me','blow mud','blow your load','blowjob','blowjobs','blue waffle','blue waffle','blumpkin','blumpkin','bod','bodily','boink','boiolas','bollock','bollocks','bollok','bollox','bondage','boned','boner','boners','bong','boob','boobies','boobs','booby','booger','bookie','boong','booobs','boooobs','booooobs','booooooobs','bootee','bootie','booty','booty call','booze','boozer','boozy','bosom','bosomy','breasts','Breeder','brotherfucker','brown showers','brunette action','buceta','bugger','bukkake','bull shit','bulldyke','bullet vibe','bullshit','bullshits','bullshitted','bullturds','bum','bum boy','bumblefuck','bumclat','bummer','buncombe','bung','bung hole','bunghole','bunny fucker','bust a load','bust a load','busty','butt','butt fuck','butt fuck','butt plug','buttcheeks','buttfuck','buttfucka','buttfucker','butthole','buttmuch','buttmunch','butt-pirate','buttplug','c.0.c.k','c.o.c.k.','c.u.n.t','c0ck','c-0-c-k','c0cksucker','caca','cacafuego','cahone','camel toe','cameltoe','camgirl','camslut','camwhore','carpet muncher','carpetmuncher','cawk','cervix','chesticle','chi-chi man','chick with a dick','child-fucker','chinc','chincs','chink','chinky','choad','choade','choade','choc ice','chocolate rosebuds','chode','chodes','chota bags','chota bags','cipa','circlejerk','cl1t','cleveland steamer','climax','clit','clit licker','clit licker','clitface','clitfuck','clitoris','clitorus','clits','clitty','clitty litter','clitty litter','clover clamps','clunge','clusterfuck','cnut','cocain','cocaine','coccydynia','cock','c-o-c-k','cock pocket','cock pocket','cock snot','cock snot','cock sucker','cockass','cockbite','cockblock','cockburger','cockeye','cockface','cockfucker','cockhead','cockholster','cockjockey','cockknocker','cockknoker','Cocklump','cockmaster','cockmongler','cockmongruel','cockmonkey','cockmunch','cockmuncher','cocknose','cocknugget','cocks','cockshit','cocksmith','cocksmoke','cocksmoker','cocksniffer','cocksuck','cocksuck','cocksucked','cocksucked','cocksucker','cock-sucker','cocksuckers','cocksucking','cocksucks','cocksucks','cocksuka','cocksukka','cockwaffle','coffin dodger','coital','cok','cokmuncher','coksucka','commie','condom','coochie','coochy','coon','coonnass','coons','cooter','cop some wood','cop some wood','coprolagnia','coprophilia','corksucker','cornhole','cornhole','corp whore','corp whore','corpulent','cox','crabs','crack','cracker','crackwhore','crap','crappy','creampie','cretin','crikey','cripple','crotte','cum','cum chugger','cum chugger','cum dumpster','cum dumpster','cum freak','cum freak','cum guzzler','cum guzzler','cumbubble','cumdump','cumdump','cumdumpster','cumguzzler','cumjockey','cummer','cummin','cumming','cums','cumshot','cumshots','cumslut','cumstain','cumtart','cunilingus','cunillingus','cunnie','cunnilingus','cunny','cunt','c-u-n-t','cunt hair','cunt hair','cuntass','cuntbag','cuntbag','cuntface','cunthole','cunthunter','cuntlick','cuntlick','cuntlicker','cuntlicker','cuntlicking','cuntlicking','cuntrag','cunts','cuntsicle','cuntsicle','cuntslut','cunt-struck','cunt-struck','cus','cut rope','cut rope','cyalis','cyberfuc','cyberfuck','cyberfuck','cyberfucked','cyberfucked','cyberfucker','cyberfuckers','cyberfucking','cyberfucking','d0ng','d0uch3','d0uche','d1ck','d1ld0','d1ldo','dago','dagos','dammit','damn','damned','damnit','darkie','darn','date rape','daterape','dawgie-style','deep throat','deepthroat','deggo','dendrophilia','dick','dick head','dick hole','dick hole','dick shy','dick shy','dickbag','dickbeaters','dickdipper','dickface','dickflipper','dickfuck','dickfucker','dickhead','dickheads','dickhole','dickish','dick-ish','dickjuice','dickmilk','dickmonger','dickripper','dicks','dicksipper','dickslap','dick-sneeze','dicksucker','dicksucking','dicktickler','dickwad','dickweasel','dickweed','dickwhipper','dickwod','dickzipper','diddle','dike','dildo','dildos','diligaf','dillweed','dimwit','dingle','dingleberries','dingleberry','dink','dinks','dipship','dipshit','dirsa','dirty','dirty pillows','dirty sanchez','dirty Sanchez','div','dlck','dog style','dog-fucker','doggie style','doggiestyle','doggie-style','doggin','dogging','doggy style','doggystyle','doggy-style','dolcett','domination','dominatrix','dommes','dong','donkey punch','donkeypunch','donkeyribber','doochbag','doofus','dookie','doosh','dopey','double dong','double penetration','Doublelift','douch3','douche','douchebag','douchebags','douche-fag','douchewaffle','douchey','dp action','drunk','dry hump','duche','dumass','dumb ass','dumbass','dumbasses','Dumbcunt','dumbfuck','dumbshit','dummy','dumshit','dvda','dyke','dykes','eat a dick','eat a dick','eat hair pie','eat hair pie','eat my ass','ecchi','ejaculate','ejaculated','ejaculates','ejaculates','ejaculating','ejaculating','ejaculatings','ejaculation','ejakulate','erect','erection','erotic','erotism','escort','essohbee','eunuch','extacy','extasy','f u c k','f u c k e r','f.u.c.k','f_u_c_k','f4nny','facial','fack','fag','fagbag','fagfucker','fagg','fagged','fagging','faggit','faggitt','faggot','faggotcock','faggots','faggs','fagot','fagots','fags','fagtard','faig','faigt','fanny','fannybandit','fannyflaps','fannyfucker','fanyy','fart','fartknocker','fatass','fcuk','fcuker','fcuking','fecal','feck','fecker','feist','felch','felcher','felching','fellate','fellatio','feltch','feltcher','female squirting','femdom','fenian','fice','figging','fingerbang','fingerfuck','fingerfuck','fingerfucked','fingerfucked','fingerfucker','fingerfucker','fingerfuckers','fingerfucking','fingerfucking','fingerfucks','fingerfucks','fingering','fist fuck','fist fuck','fisted','fistfuck','fistfucked','fistfucked','fistfucker','fistfucker','fistfuckers','fistfuckers','fistfucking','fistfucking','fistfuckings','fistfuckings','fistfucks','fistfucks','fisting','fisty','flamer','flange','flaps','fleshflute','flog the log','flog the log','floozy','foad','foah','fondle','foobar','fook','fooker','foot fetish','footjob','foreskin','freex','frenchify','frigg','frigga','frotting','fubar','fuc','fuck','fuck','f-u-c-k','fuck buttons','fuck hole','fuck hole','Fuck off','fuck puppet','fuck puppet','fuck trophy','fuck trophy','fuck yo mama','fuck yo mama','fuck you','fucka','fuckass','fuck-ass','fuck-ass','fuckbag','fuck-bitch','fuck-bitch','fuckboy','fuckbrain','fuckbutt','fuckbutter','fucked','fuckedup','fucker','fuckers','fuckersucker','fuckface','fuckhead','fuckheads','fuckhole','fuckin','fucking','fuckings','fuckingshitmotherfucker','fuckme','fuckme','fuckmeat','fuckmeat','fucknugget','fucknut','fucknutt','fuckoff','fucks','fuckstick','fucktard','fuck-tard','fucktards','fucktart','fucktoy','fucktoy','fucktwat','fuckup','fuckwad','fuckwhit','fuckwit','fuckwitt','fudge packer','fudgepacker','fudge-packer','fuk','fuker','fukker','fukkers','fukkin','fuks','fukwhit','fukwit','fuq','futanari','fux','fux0r','fvck','fxck','gae','gai','gang bang','gangbang','gang-bang','gang-bang','gangbanged','gangbangs','ganja','gash','gassy ass','gassy ass','gay','gay sex','gayass','gaybob','gaydo','gayfuck','gayfuckist','gaylord','gays','gaysex','gaytard','gaywad','gender bender','genitals','gey','gfy','ghay','ghey','giant cock','gigolo','ginger','gippo','girl on','girl on top','girls gone wild','git','glans','goatcx','goatse','god','god damn','godamn','godamnit','goddam','god-dam','goddammit','goddamn','goddamned','god-damned','goddamnit','godsdamn','gokkun','golden shower','goldenshower','golliwog','gonad','gonads','goo girl','gooch','goodpoop','gook','gooks','goregasm','gringo','grope','group sex','gspot','g-spot','gtfo','guido','guro','h0m0','h0mo','ham flap','ham flap','hand job','handjob','hard core','hard on','hardcore','hardcoresex','he11','hebe','heeb','hell','hemp','hentai','heroin','herp','herpes','herpy','heshe','he-she','hircismus','hitler','hiv','ho','hoar','hoare','hobag','hoe','hoer','holy shit','hom0','homey','homo','homodumbshit','homoerotic','homoey','honkey','honky','hooch','hookah','hooker','hoor','hootch','hooter','hooters','hore','horniest','horny','hot carl','hot chick','hotsex','how to kill','how to murdep',
    'how to murder','huge fat','hump','humped','humping','hun','hussy','hymen','iap','iberian slap','inbred','incest','injun','intercourse','jack off','jackass','jackasses','jackhole','jackoff','jack-off','jaggi','jagoff','jail bait','jailbait','jap','japs','jelly donut','jerk','jerk off','jerk0ff','jerkass','jerked','jerkoff','jerk-off','jigaboo','jiggaboo','jiggerboo','jism','jiz','jiz','jizm','jizm','jizz','jizzed','jock','juggs','jungle bunny','junglebunny','junkie','junky','kafir','kawk','kike','kikes','kill','kinbaku','kinkster','kinky','klan','knob','knob end','knobbing','knobead','knobed','knobend','knobhead','knobjocky','knobjokey','kock','kondum','kondums','kooch','kooches','kootch','kraut','kum','kummer','kumming','kums','kunilingus','kunja','kunt','kwif','kwif','kyke','l3i+ch','l3itch','labia','lameass','lardass','leather restraint','leather straight jacket','lech','lemon party','LEN','leper','lesbian','lesbians','lesbo','lesbos','lez','lezza/lesbo','lezzie','lmao','lmfao','loin','loins','lolita','looney','lovemaking','lube','lust','lusting','lusty','m0f0','m0fo','m45terbate','ma5terb8','ma5terbate','mafugly','mafugly','make me come','male squirting','mams','masochist','massa','masterb8','masterbat*','masterbat3','masterbate','master-bate','master-bate','masterbating','masterbation','masterbations','masturbate','masturbating','masturbation','maxi','mcfagget','menage a trois','menses','menstruate','menstruation','meth','m-fucking','mick','microphallus','middle finger','midget','milf','minge','minger','missionary position','mof0','mofo','mo-fo','molest','mong','moo moo foo foo','moolie','moron','mothafuck','mothafucka','mothafuckas','mothafuckaz','mothafucked','mothafucked','mothafucker','mothafuckers','mothafuckin','mothafucking','mothafucking','mothafuckings','mothafucks','mother fucker','mother fucker','motherfuck','motherfucka','motherfucked','motherfucker','motherfuckers','motherfuckin','motherfucking','motherfuckings','motherfuckka','motherfucks','mound of venus','mr hands','muff','muff diver','muff puff','muff puff','muffdiver','muffdiving','munging','munter','murder','mutha','muthafecker','muthafuckker','muther','mutherfucker','n1gga','n1gger','naked','nambla','napalm','nappy','nawashi','nazi','nazism','need the dick','need the dick','negro','neonazi','nig nog','nigaboo','nigg3r','nigg4h','nigga','niggah','niggas','niggaz','nigger','niggers','niggle','niglet','nig-nog','nimphomania','nimrod','ninny','ninnyhammer','nipple','nipples','nob','nob jokey','nobhead','nobjocky','nobjokey','nonce','nsfw images','nude','nudity','numbnuts','nut butter','nut butter','nut sack','nutsack','nutter','nympho','nymphomania','octopussy','old bag','omg','omorashi','one cup two girls','one guy one jar','opiate','opium','orally','organ','orgasim','orgasims','orgasm','orgasmic','orgasms','orgies','orgy','ovary','ovum','ovums','p.u.s.s.y.','p0rn','paedophile','paki','panooch','pansy','pantie','panties','panty','pawn','pcp','pecker','peckerhead','pedo','pedobear','pedophile','pedophilia','pedophiliac','pee','peepee','pegging','penetrate','penetration','penial','penile','penis','penisbanger','penisfucker','penispuffer','perversion','phallic','phone sex','phonesex','phuck','phuk','phuked','phuking','phukked','phukking','phuks','phuq','piece of shit','pigfucker','pikey','pillowbiter','pimp','pimpis','pinko','piss','piss off','piss pig','pissed','pissed off','pisser','pissers','pisses','pisses','pissflaps','pissin','pissin','pissing','pissoff','pissoff','piss-off','pisspig','playboy','pleasure chest','pms','polack','pole smoker','polesmoker','pollock','ponyplay','poof','poon','poonani','poonany','poontang','poop','poop chute','poopchute','Poopuncher','porch monkey','porchmonkey','porn','porno','pornography','pornos','pot','potty','prick','pricks','prickteaser','prig','prince albert piercing','prod','pron','prostitute','prude','psycho','pthc','pube','pubes','pubic','pubis','punani','punanny','punany','punkass','punky','punta','puss','pusse','pussi','pussies','pussy','pussy fart','pussy fart','pussy palace','pussy palace','pussylicking','pussypounder','pussys','pust','puto','queaf','queaf','queef','queer','queerbait','queerhole','queero','queers','quicky','quim','racy','raghead','raging boner','rape','raped','raper','rapey','raping','rapist','raunch','rectal','rectum','rectus','reefer','reetard','reich','renob','retard','retarded','reverse cowgirl','revue','rimjaw','rimjob','rimming','ritard','rosy palm','rosy palm and her 5 sisters','rtard','r-tard','rubbish','rum','rump','rumprammer','ruski','rusty trombone','s hit','s&m','s.h.i.t.','s.o.b.','s_h_i_t','s0b','sadism','sadist','sambo','sand nigger','sandbar','sandbar','Sandler','sandnigger','sanger','santorum','sausage queen','sausage queen','scag','scantily','scat','schizo','schlong','scissoring','screw','screwed','screwing','scroat','scrog','scrot','scrote','scrotum','scrud','scum','seaman','seamen','seduce','seks','semen','sex','sexo','sexual','sexy','sh!+','sh!t','sh1t','s-h-1-t','shag','shagger','shaggin','shagging','shamedame','shaved beaver','shaved pussy','shemale','shi+','shibari','shirt lifter','shit','s-h-i-t','shit ass','shit fucker','shit fucker','shitass','shitbag','shitbagger','shitblimp','shitbrains','shitbreath','shitcanned','shitcunt','shitdick','shite','shiteater','shited','shitey','shitface','shitfaced','shitfuck','shitfull','shithead','shitheads','shithole','shithouse','shiting','shitings','shits','shitspitter','shitstain','shitt','shitted','shitter','shitters','shitters','shittier','shittiest','shitting','shittings','shitty','shiz','shiznit','shota','shrimping','sissy','skag','skank','skeet','skullfuck','slag','slanteye','slave','sleaze','sleazy','slope','slope','slut','slut bucket','slut bucket','slutbag','slutdumper','slutkiss','sluts','smartass','smartasses','smeg','smegma','smut','smutty','snatch','sniper','snowballing','snuff','s-o-b','sod off','sodom','sodomize','sodomy','son of a bitch','son of a motherless goat','son of a whore','son-of-a-bitch','souse','soused','spac','spade','sperm','spic','spick','spik','spiks','splooge','splooge moose','spooge','spook','spread legs','spunk','stfu','stiffy','stoned','strap on','strapon','strappado','strip','strip club','stroke','stupid','style doggy','suck','suckass','sucked','sucking','sucks','suicide girls','sultry women','sumofabiatch','swastika','swinger','t1t','t1tt1e5','t1tties','taff','taig','tainted love','taking the piss','tampon','tard','tart','taste my','tawdry','tea bagging','teabagging','teat','teets','teez','teste','testee','testes','testical','testicle','testis','threesome','throating','thrust','thug','thundercunt','tied up','tight white','tinkle','tit','tit wank','tit wank','titfuck','titi','tities','tits','titt','tittie5','tittiefucker','titties','titty','tittyfuck','tittyfucker','tittywank','titwank','toke','tongue in a','toots','topless','tosser','towelhead','tramp','tranny','transsexual','trashy','tribadism','trumped','tub girl','tubgirl','turd','tush','tushy','tw4t','twat','twathead','twatlips','twats','twatty','twatwaffle','twink','twinkie','two fingers','two fingers with tongue','two girls one cup','twunt','twunter','ugly','unclefucker','undies','undressing','unwed','upskirt','urethra play','urinal','urine','urophilia','uterus','uzi','v14gra','v1gra','vag','vagina','vajayjay','va-j-j','valium','venus mound','veqtable','viagra','vibrator','violet wand','virgin','vixen','vjayjay','vodka','vomit','vorarephilia','voyeur','vulgar','vulva','w00se','wad','wang','wank','wanker','wankjob','wanky','wazoo','wedgie','weed','weenie','weewee','weiner','weirdo','wench','wet dream','wetback','wh0re','wh0reface','white power','whiz','whoar','whoralicious','whore','whorealicious','whorebag','whored','whoreface','whorehopper','whorehouse','whores','whoring','wigger','willies','willy','window licker','wiseass','wiseasses','wog','womb','wop','wrapping men','wrinkled starfish','wtf','xrated','x-rated','xx','xxx','yaoi','yeasty','yellow showers','yid','yiffy','yobbo','zibbi','zoophilia','zubb',''
];
    var moreWords2 = ["4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka", "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch", "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs", "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris", "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok", "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts", "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker", "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag", "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook", "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker", "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell", "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead", "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate", "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker", "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop", "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing", "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting", "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez", "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina", "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"];
    filter.addWords(...moreWords);
    filter.addWords(...moreWords2);

    con.query("INSERT INTO tblReview (restID, userID, description, rating, rDate) VALUES (?, ?, ?, ?, NOW())", [restID, userID, filter.clean(description), rating], function (err, result) {
      con.end();
      if (err) {
        console.log("insertReview SQL failed" + err.stack);
        return callback(err);
      }
      console.log("successfully inserted the review");
      return callback(null);
    })

  })
}

function getReviews(restID, callback) {
  var con = connection();
  con.connect(function (err) {
    if (err) {
      console.log('Database connection failed: ' + err.stack);
      return callback(err, null);
    }
  })

  con.query("SELECT R.userID, R.reviewID, R.rating, R.description, R.rDate, U.firstName, U.lastName FROM ebdb.tblReview R JOIN tblUser U ON U.userID = R.userID WHERE R.restID = ? ORDER BY rDate DESC LIMIT 50", [restID], function (err, result) {
    con.end();
    if (err) {
      console.log("getReviews SQL failed" + err.stack);
      return callback(err, null);
    }
    console.log("successfully got list of reviews");
    return callback(null, result);

  })
}

function getMostRecentReview(restID, callback) {
  var con = connection();
  con.connect(function (err) {
    if (err) {
      console.log('Database connection failed: ' + err.stack);
      return callback(err, null);
    }
  })

  con.query("SELECT R.userID, R.reviewID, R.rating, R.description, R.rDate, U.firstName, U.lastName FROM ebdb.tblReview R JOIN tblUser U ON U.userID = R.userID WHERE R.restID = ? ORDER BY rDate DESC LIMIT 1", [restID], function (err, result) {
    con.end();
    if (err) {
      console.log("getMostRecentReview SQL failed" + err.stack);
      return callback(err, null);
    }
    if(result.length == 0){
      console.log("no review");
      return callback(null, null);
    }
    console.log("successfully retreived recent review");
    return callback(null, result[0]);

  })
}

function deleteReview(reviewID, callback){
  var con = connection();
  con.connect(function (err) {
    if (err) {
      console.log('Database connection failed: ' + err.stack);
      return callback(err, null);
    }
  })

  con.query("DELETE FROM tblReview WHERE reviewID = ?", [reviewID], function (err, result) {
    con.end();
    if (err) {
      console.log("deleteReview SQL failed" + err.stack);
      return callback(err);
    }
    return callback(null);
  })
}

module.exports.checkRestaurant = checkRestaurant;
module.exports.insertRestaurant = insertRestaurant;
module.exports.getRestaurantID = getRestaurantID;
module.exports.getRatingSumAndCount = getRatingSumAndCount;
module.exports.getRestaurantInfoByAlias = getRestaurantInfoByAlias;
module.exports.insertReview = insertReview;
module.exports.getReviews = getReviews;
module.exports.getMostRecentReview = getMostRecentReview;
module.exports.deleteReview = deleteReview;