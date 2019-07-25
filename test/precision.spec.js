const { expect } = require('chai');

const BaseJoi = require('@hapi/joi');
const Decimal = require('decimal.js');
const DecimalExtension = require('..');

const Joi = BaseJoi.extend(DecimalExtension);

const shouldSucceed = (expected, value, sd, rm, globRm) => {
  it('should round to a precision', () => {
    const decValidator = Joi.decimal().precision(sd, rm);

    const result = decValidator.validate(value);

    expect(result.error).to.be.null;
    expect(result.value.toString()).to.be.equal(expected);

    if (globRm) expect(Decimal.rounding).to.be.equal(globRm);
  });
};

const shouldFail = (value, sd, rm) => {
  it('should throw an exeption', () => {
    expect(() => {
      const decValidator = Joi.decimal().precision(sd, rm);

      const result = decValidator.validate(value);
      console.log(value);
      console.log(result);
    }).to.throw();
  });
};

describe('decimal - precision', () => {
  before(() => {
    Decimal.set({ defaults: true });

    Decimal.config({
      precision: 20,
      rounding: 4,
      toExpNeg: -7,
      toExpPos: 40,
      minE: -9e15,
      maxE: 9e15,
    });
  });

  shouldSucceed('45.6', '45.6');
  shouldSucceed('45.6', new Decimal('45.6'));
  shouldSucceed('5e+1', '45.6', 1);
  shouldSucceed('5e+1', new Decimal('45.6'), 1);
  shouldSucceed('46', new Decimal('45.6'), 2, Decimal.ROUND_UP);
  shouldSucceed('45', new Decimal('45.6'), 2, Decimal.ROUND_DOWN);
  shouldSucceed('45.600', '45.6', 5);
  shouldSucceed('45.600', new Decimal('45.6'), 5);

  // ---------------------------------------------------------------- v8 start

  shouldSucceed('1e+27', '1.2345e+27', 1);
  shouldSucceed('1.2e+27', '1.2345e+27', 2);
  shouldSucceed('1.23e+27', '1.2345e+27', 3);
  shouldSucceed('1.235e+27', '1.2345e+27', 4);
  shouldSucceed('1.2345e+27', '1.2345e+27', 5);
  shouldSucceed('1.23450e+27', '1.2345e+27', 6);
  shouldSucceed('1.234500e+27', '1.2345e+27', 7);

  shouldSucceed('-1e+27', '-1.2345e+27', 1);
  shouldSucceed('-1.2e+27', '-1.2345e+27', 2);
  shouldSucceed('-1.23e+27', '-1.2345e+27', 3);
  shouldSucceed('-1.235e+27', '-1.2345e+27', 4);
  shouldSucceed('-1.2345e+27', '-1.2345e+27', 5);
  shouldSucceed('-1.23450e+27', '-1.2345e+27', 6);
  shouldSucceed('-1.234500e+27', '-1.2345e+27', 7);

  shouldSucceed('7', 7, 1);
  shouldSucceed('7.0', 7, 2);
  shouldSucceed('7.00', 7, 3);

  shouldSucceed('-7', -7, 1);
  shouldSucceed('-7.0', -7, 2);
  shouldSucceed('-7.00', -7, 3);

  shouldSucceed('9e+1', 91, 1);
  shouldSucceed('91', 91, 2);
  shouldSucceed('91.0', 91, 3);
  shouldSucceed('91.00', 91, 4);

  shouldSucceed('-9e+1', -91, 1);
  shouldSucceed('-91', -91, 2);
  shouldSucceed('-91.0', -91, 3);
  shouldSucceed('-91.00', -91, 4);

  shouldSucceed('9e+1', 91.1234, 1);
  shouldSucceed('91', 91.1234, 2);
  shouldSucceed('91.1', 91.1234, 3);
  shouldSucceed('91.12', 91.1234, 4);
  shouldSucceed('91.123', 91.1234, 5);
  shouldSucceed('91.1234', 91.1234, 6);
  shouldSucceed('91.12340', 91.1234, 7);
  shouldSucceed('91.123400', 91.1234, 8);
  shouldSucceed('-9e+1', -91.1234, 1);
  shouldSucceed('-91', -91.1234, 2);
  shouldSucceed('-91.1', -91.1234, 3);
  shouldSucceed('-91.12', -91.1234, 4);
  shouldSucceed('-91.123', -91.1234, 5);
  shouldSucceed('-91.1234', -91.1234, 6);
  shouldSucceed('-91.12340', -91.1234, 7);
  shouldSucceed('-91.123400', -91.1234, 8);

  shouldSucceed('NaN', NaN, 1);
  shouldSucceed('Infinity', Infinity, 2);
  shouldSucceed('-Infinity', -Infinity, 2);

  shouldSucceed('5.55000000000000e-7', 0.000000555, 15);
  shouldSucceed('-5.55000000000000e-7', -0.000000555, 15);
  shouldSucceed('-1.2e-9', -0.0000000012345, 2);
  shouldSucceed('-1.2e-8', -0.000000012345, 2);
  shouldSucceed('-1.2e-7', -0.00000012345, 2);
  shouldSucceed('1e+8', 123456789, 1);
  shouldSucceed('123456789', 123456789, 9);
  shouldSucceed('1.2345679e+8', 123456789, 8);
  shouldSucceed('1.234568e+8', 123456789, 7);
  shouldSucceed('-1.234568e+8', -123456789, 7);

  shouldSucceed('-0.0000012', -0.0000012345, 2);
  shouldSucceed('-0.000012', -0.000012345, 2);
  shouldSucceed('-0.00012', -0.00012345, 2);
  shouldSucceed('-0.0012', -0.0012345, 2);
  shouldSucceed('-0.012', -0.012345, 2);
  shouldSucceed('-0.12', -0.12345, 2);
  shouldSucceed('-1.2', -1.2345, 2);
  shouldSucceed('-12', -12.345, 2);
  shouldSucceed('-1.2e+2', -123.45, 2);
  shouldSucceed('-1.2e+3', -1234.5, 2);
  shouldSucceed('-1.2e+4', -12345, 2);
  shouldSucceed('-1.235e+4', -12345.67, 4);
  shouldSucceed('-1.234e+4', -12344.67, 4);

  shouldSucceed('1.3', 1.25, 2);
  shouldSucceed('1.4', 1.35, 2);

  it('set Decimal.rounding to 0', () => {
    Decimal.rounding = 0;
  });

  shouldSucceed('1e+4', 9631.01, 1, 4);
  shouldSucceed('1.0e+7', 9950095.87, 2, 4);
  shouldSucceed('1e+1', '9.856839969', 1, 4);
  shouldSucceed('1e+2', '97.504', 1, 4);
  shouldSucceed('1e+5', 97802.6, 1, 4);
  shouldSucceed('1e+1', 9.9617, 1, 4);
  shouldSucceed('1e+3', 989.2, 1, 4);
  shouldSucceed('1.0e+5', 99576, 2, 4);
  shouldSucceed('1e+8', '96236483.87', 1, 4);

  // ------------------------------------------------------------------ v8 end

  shouldSucceed('-0.00001', '-0.00001', 1);
  shouldSucceed('-0.000090000000', '-0.00009', 8);
  shouldSucceed('-7e-7', '-0.0000007', 1);
  shouldSucceed('68.9316834061848', '68.931683406184761912218250317', 15);
  shouldSucceed('7.8601018089704732e+27', '7860101808970473167417935916.60087069', 17);
  shouldSucceed('3.21445885399803244067719798337437062000000e-11', '0.0000000000321445885399803244067719798337437062', 42);
  shouldSucceed('-8171786349835057630612358814.162756978', '-8171786349835057630612358814.162756977984', 37);
  shouldSucceed('3340.9039701', '3340.903970019817086594869184429527413533291595472085', 11);
  shouldSucceed('-7269097658095414435895.9161181115739745427300313060', '-7269097658095414435895.916118111573974542730031306', 50);
  shouldSucceed('0.00000632207', '0.00000632206077863', 6);
  shouldSucceed('6e+2', '573', 1);
  shouldSucceed('7.4e-7', '0.000000738', 2);
  shouldSucceed('-5.031561e-7', '-0.0000005031560306227217140253964236911907612837', 7);
  shouldSucceed('-4.291e+11', '-429050053964', 4);
  shouldSucceed('8.514e+7', '85131637', 4);
  shouldSucceed('-3.4e-9', '-0.000000003326783057540398442677461', 2);
  shouldSucceed('6.9404295962722512e-20', '0.00000000000000000006940429596272251146200868514973032594273', 17);
  shouldSucceed('-828376248340605120247.15155295014', '-828376248340605120247.15155295013990774586360178257303370779', 32);
  shouldSucceed('-7.9828e+6', '-7982750.6677764682946015520272838914918899297118139169410659', 5);
  shouldSucceed('0.00712610393722542527880200', '0.007126103937225425278801997738', 24);
  shouldSucceed('-5.7e+4', '-56242', 2);
  shouldSucceed('-8928855203945443164.755136735230293537', '-8928855203945443164.755136735230293536124112124', 37);
  shouldSucceed('5218572327.99', '5218572327.98424443372003772604597054153304', 12);
  shouldSucceed('71707870535238750871516796339.60', '71707870535238750871516796339.59678962573869890935', 31);
  shouldSucceed('88817462.7137982220652429', '88817462.71379822206524285939115943006583441400005007918', 24);
  shouldSucceed('3.00000e-9', '0.000000003', 6);
  shouldSucceed('-6.053', '-6.05291095813493573191', 4);
  shouldSucceed('6.51630828677e+19', '65163082867698740076', 12);
  shouldSucceed('2483202135696501.60187899', '2483202135696501.60187898870193199949004966876115645', 24);
  shouldSucceed('1.0766e-10', '0.000000000107650515680635692286894826641576642261', 5);
  shouldSucceed('642724503819056076.659397077514269963295025', '642724503819056076.659397077514269963295024012414', 42);
  shouldSucceed('-7.1192e+21', '-7119169102619893823635.32141854354', 5);
  shouldSucceed('-6.717481255640638829101946114674e-8', '-0.000000067174812556406388291019461146732616998258', 31);
  shouldSucceed('-12.41976452', '-12.4197645179995365323309894', 10);
  shouldSucceed('-6.529258780126449116249954644017839921024112900e-16', '-0.00000000000000065292587801264491162499546440178399210241129', 46);
  shouldSucceed('-441838.0', '-441838', 7);
  shouldSucceed('1.128285293592950e-8', '0.000000011282852935929493101783925259749957192', 16);
  shouldSucceed('-8.654857e+7', '-86548567', 7);
  shouldSucceed('3.8883293855303995e-7', '0.00000038883293855303994672627854769926811949', 17);
  shouldSucceed('3.25870000e-13', '0.00000000000032587', 9);
  shouldSucceed('3.702e+6', '3701031.59037494113', 4);
  shouldSucceed('-3580077435.93682917449675702508371047', '-3580077435.93682917449675702508371046631533', 36);
  shouldSucceed('-7.400', '-7.4', 4);
  shouldSucceed('109519523263844229810.068', '109519523263844229810.067657779734413280795410968892638', 24);
  shouldSucceed('-509247322311590671954830.86847660619', '-509247322311590671954830.8684766061855', 35);
  shouldSucceed('7.5518638430980800496570562671727890e-10', '0.00000000075518638430980800496570562671727889997', 35);
  shouldSucceed('-5056721600639122835615986051.468831942818200', '-5056721600639122835615986051.4688319428182', 43);
  shouldSucceed('-1.796146861125551785886171829251460000000000e-16', '-0.000000000000000179614686112555178588617182925146', 43);
  shouldSucceed('6.0e+2', '599', 2);
  shouldSucceed('7.619930e-16', '0.00000000000000076199293', 7);
  shouldSucceed('834668.2370121038159610193', '834668.237012103815961019258574789273273342', 25);
  shouldSucceed('-3.92251395952329649490768e+26', '-392251395952329649490767912.240768552138247705202732', 24);
  shouldSucceed('-47504099413385554632166.5098', '-47504099413385554632166.50972492550706', 27);

  it('set Decimal.rounding to 1', () => {
    Decimal.rounding = 1;
  });

  shouldSucceed('-1.4e+9', '-1336106841', 2, 0);
  shouldSucceed('-2244450.2134814273335263', '-2244450.2134814273335262397290334104071203538487453309626146', 23, 0);
  shouldSucceed('8.74e+29', '873625255363763952428129881990.679929486040461455296118489', 3, 0);
  shouldSucceed('-1.85453549733179613185923288786', '-1.8545354973317961318592328878502252820666161607740183', 30, 0);
  shouldSucceed('431.7150651927', '431.71506519265522010949747887049', 13, 0);
  shouldSucceed('-8606297211156287.52520023752564', '-8606297211156287.5252002375256362382564355963505470716151', 30, 0);
  shouldSucceed('-8.4634889709e+24', '-8463488970828351722405003.220603', 11, 0);

  shouldSucceed('-844789036.5239726', '-844789036.52397268892', 16);
  shouldSucceed('-5056.20629012767878749185273209679064306054', '-5056.206290127678787491852732096790643060542', 42);
  shouldSucceed('-0.3287519131314873763501859870298952500', '-0.32875191313148737635018598702989525', 37);
  shouldSucceed('-60729764', '-60729764', 8);
  shouldSucceed('-7.622e-14', '-0.00000000000007622481594531380999826456196664586', 4);
  shouldSucceed('-4686402261639729535.736324492474', '-4686402261639729535.7363244924747488', 31);
  shouldSucceed('-2.0', '-2', 2);
  shouldSucceed('-13801188035233586637950193108.13592574381473451125649500', '-13801188035233586637950193108.135925743814734511256495', 55);
  shouldSucceed('0.0000807327587149839799300000', '0.00008073275871498397993', 24);
  shouldSucceed('-6.000000e-8', '-0.00000006', 7);
  shouldSucceed('-3.83574993e+11', '-383574993535', 9);
  shouldSucceed('7.6987000000000000e-14', '0.000000000000076987', 17);
  shouldSucceed('80928866804.6112050947427973', '80928866804.6112050947427973864826014844575374353', 27);
  shouldSucceed('-0.00730140', '-0.0073014067221009206110062377503733', 6);
  shouldSucceed('2.72104773884160491036088486e+30', '2721047738841604910360884862459.4086993273252009015', 27);
  shouldSucceed('3.008780781917733594e+25', '30087807819177335941398228.1424107931203', 19);
  shouldSucceed('-1.31528920779613669158250146972297797867760000000000000000000e-19', '-0.00000000000000000013152892077961366915825014697229779786776', 60);
  shouldSucceed('-8.5e+11', '-858982311008.257025719798657844609315293821', 2);
  shouldSucceed('-3.6312e-12', '-0.0000000000036312827608449878', 5);
  shouldSucceed('-0.0060000', '-0.006', 5);
  shouldSucceed('-4.65727e+23', '-465727983501322687372765', 6);
  shouldSucceed('-0.00000332331666628036603', '-0.000003323316666280366035430077076052', 18);
  shouldSucceed('3.533702e-8', '0.00000003533702791135712510338001418872124', 7);
  shouldSucceed('-0.04340', '-0.0434', 4);
  shouldSucceed('-597340.278566069086858587852236235470', '-597340.2785660690868585878522362354706741', 36);
  shouldSucceed('6.000e-8', '0.00000006', 4);
  shouldSucceed('-3.624323359112776296e-19', '-0.00000000000000000036243233591127762966338166', 19);
  shouldSucceed('-3731378568692042924197.154', '-3731378568692042924197.15400334142251496795634388', 25);
  shouldSucceed('-68249040894032065692.62', '-68249040894032065692.62771690318493', 22);
  shouldSucceed('8786096722661914.89732851', '8786096722661914.89732851188880184891692993684242690315', 24);
  shouldSucceed('-1.8413321536281347264486372900000000000e-12', '-0.00000000000184133215362813472644863729', 38);
  shouldSucceed('4.0e-9', '0.0000000040395827543504045', 2);
  shouldSucceed('-2.9427e+16', '-29427119846374896', 5);
  shouldSucceed('-917760614.4', '-917760614.45404359204911454', 10);
  shouldSucceed('8e+4', '89427', 1);
  shouldSucceed('0.00000920323988134356953828667260', '0.0000092032398813435695382866726', 27);
  shouldSucceed('8.2e+16', '82068995955708118', 2);
  shouldSucceed('3.35195944828e+26', '335195944828445911672446409.3379497158141', 12);
  shouldSucceed('-3.89774891030e-9', '-0.00000000389774891030223957363124620581272897758735065471', 12);
  shouldSucceed('-4', '-4', 1);
  shouldSucceed('8', '8', 1);
  shouldSucceed('1.41172955693912934219137966000000e-10', '0.000000000141172955693912934219137966', 33);
  shouldSucceed('9.21481e+13', '92148111958857', 6);
  shouldSucceed('-5.859975978432853e-18', '-0.0000000000000000058599759784328539', 16);
  shouldSucceed('-72.0', '-72', 3);
  shouldSucceed('3785098751297.8929911950994079707157472', '3785098751297.89299119509940797071574729867819252140059', 38);
  shouldSucceed('4.38e+16', '43893416753778361.297703358127215475077814', 3);
  shouldSucceed('-33110.29096', '-33110.2909623520267070846514', 10);
  shouldSucceed('-74.38305251784882707720486436292121914036495', '-74.3830525178488270772048643629212191403649548392158614', 43);

  it('set Decimal.rounding to 2', () => {
    Decimal.rounding = 2;
  });

  shouldSucceed('5.80e+18', '5805164734299168659.6173113885173384955443', 3, 1);
  shouldSucceed('-1.719875889271327', '-1.719875889271327133154458155573493605566221534', 16, 1);
  shouldSucceed('113.672129563', '113.672129563441659725876055771857758675550104070419635029', 12, 1);
  shouldSucceed('-77950052814622081084397.9', '-77950052814622081084397.91853869253589242574', 24, 1);
  shouldSucceed('4.53106985e+27', '4531069852787151785292512309.2901993579425172826443679877', 9, 1);
  shouldSucceed('45285.246089613169416440797840714', '45285.2460896131694164407978407142422013937', 32, 1);
  shouldSucceed('307760226411464.7333268079863299', '307760226411464.73332680798632996332324381779707', 31, 1);

  shouldSucceed('-0.0300', '-0.0300921721159558', 3);
  shouldSucceed('65317841202.20949859371772273480125', '65317841202.2094985937177227348012464402154', 34);
  shouldSucceed('-8.9231575495202e+29', '-892315754952021994731329589682.1894180393920044085713', 14);
  shouldSucceed('-2.8075679202e-8', '-0.0000000280756792028583066', 11);
  shouldSucceed('9.71456e+9', '9714558552', 6);
  shouldSucceed('2.9514099281e-10', '0.00000000029514099281', 11);
  shouldSucceed('-1.24459e+14', '-124459985101107', 6);
  shouldSucceed('0.0000734657394154607815562372000000', '0.0000734657394154607815562372', 30);
  shouldSucceed('1.78719530353972e+15', '1787195303539715', 15);
  shouldSucceed('-2.8e+9', '-2861102528', 2);
  shouldSucceed('-8.74480375581000e-9', '-0.00000000874480375581', 15);
  shouldSucceed('-1792404726015427380.248150830448457643618022', '-1792404726015427380.248150830448457643618022', 43);
  shouldSucceed('-678437320202616518.2220157912209286', '-678437320202616518.22201579122092864', 34);
  shouldSucceed('-1.937304915215780220809799809655893674619672771e-8', '-0.000000019373049152157802208097998096558936746196727718', 46);
  shouldSucceed('824172.15863347130174103087', '824172.15863347130174103086069960571', 26);
  shouldSucceed('1.90040714061724000e-9', '0.00000000190040714061724', 18);
  shouldSucceed('-1634488249956745498.58311', '-1634488249956745498.58311123049258868631623840423306', 24);
  shouldSucceed('0.0000019600923098540334001755857361187871270117098000', '0.0000019600923098540334001755857361187871270117098', 47);
  shouldSucceed('8.383e+4', '83829', 4);
  shouldSucceed('2.843306120337864064e+23', '284330612033786406376718', 19);
  shouldSucceed('1.86235e+15', '1862340943682995.08270612464203237562317928642459', 6);
  shouldSucceed('-2.31e+13', '-23195312138083', 3);
  shouldSucceed('5.450237e+21', '5450236028274773541895.65198933808968167192289601277', 7);
  shouldSucceed('-0.008976419749408075453861117865459', '-0.00897641974940807545386111786545972434475187220274239581167', 31);
  shouldSucceed('-761181660548661030.25', '-761181660548661030.25539542029', 20);
  shouldSucceed('-1844205.93619958', '-1844205.936199580689273072905714475263817', 15);
  shouldSucceed('4842.77906784902805070438222238898372327093', '4842.77906784902805070438222238898372327092242428134814721', 42);
  shouldSucceed('-4.161198953445629503503971e+26', '-416119895344562950350397179', 25);
  shouldSucceed('1.084e+4', '10836', 4);
  shouldSucceed('8.71081704218174598654542083000e-8', '0.0000000871081704218174598654542083', 30);
  shouldSucceed('7.9139683e+36', '7913968291641940848703040206324645237.8515176490912667096', 8);
  shouldSucceed('-0.000008', '-0.000008', 1);
  shouldSucceed('8.3660085625e+34', '83660085624983922907621996804192921.3992927', 11);
  shouldSucceed('0.000006980263008', '0.000006980263007423150706324065130475391', 10);
  shouldSucceed('-31348084528321454060964445534333629317.69561497283830023', '-31348084528321454060964445534333629317.69561497283830023', 55);
  shouldSucceed('-2417953792643886.3485495754363678888681996409674308643', '-2417953792643886.3485495754363678888681996409674308643', 53);
  shouldSucceed('4.0e+6', '3982592', 2);
  shouldSucceed('-2092315.015029722200', '-2092315.0150297222', 19);
  shouldSucceed('-364992136844916.9092238', '-364992136844916.909223894931280218350055327754935', 22);
  shouldSucceed('8.34e+24', '8333642861002789136219873', 3);
  shouldSucceed('7.6008837179413e+14', '760088371794122.3380234188299740029832128019574765416', 14);
  shouldSucceed('-6655726127.0', '-6655726127', 11);

  it('set Decimal.rounding to 3', () => {
    Decimal.rounding = 3;
  });

  shouldSucceed('-1.7218673528e+29', '-172186735288586033321621121024.11240623', 11, 2);
  shouldSucceed('-3.31e+28', '-33197729862068219255677464974', 3, 2);
  shouldSucceed('-4.835191326e+29', '-483519132605694848658321267839.23575134378118945659616358', 10, 2);
  shouldSucceed('7.3', '7.24882150443803', 2, 2);
  shouldSucceed('-89186640077683569.407061427673', '-89186640077683569.4070614276736450982125609', 29, 2);
  shouldSucceed('-49379651041268.5', '-49379651041268.548293', 15, 2);
  shouldSucceed('-7685054.17489171951660', '-7685054.17489171951660508194254495141726065698575306365447451', 21, 2);

  shouldSucceed('-39449414270333.925852213835', '-39449414270333.925852213834759031494508489474', 26);
  shouldSucceed('-7.50437989976', '-7.50437989975503711836768', 12);
  shouldSucceed('-0.000004303975760000000', '-0.00000430397576', 16);
  shouldSucceed('-16040233916257241895.97650633973989', '-16040233916257241895.9765063397398857', 34);
  shouldSucceed('-7438.9287248601393819', '-7438.9287248601393818639176907606', 20);
  shouldSucceed('9.857465584298e-7', '0.000000985746558429876825600458537705318327799', 13);
  shouldSucceed('532637.9095983547284850466577958315920', '532637.90959835472848504665779583159203905641996', 37);
  shouldSucceed('-1.40416695292e+30', '-1404166952915258058306475434520.7856110230505157', 12);
  shouldSucceed('60346876.6670832429026869255506808488', '60346876.6670832429026869255506808488', 36);
  shouldSucceed('-2.52466133e+23', '-252466132238128405832984', 9);
  shouldSucceed('55', '55', 2);
  shouldSucceed('-63075151.962465776516325792253177939493172', '-63075151.9624657765163257922531779394931714', 41);
  shouldSucceed('7.411461e+17', '741146113404361548.543142388', 7);
  shouldSucceed('-58835755359067474972692072494278983.7', '-58835755359067474972692072494278983.6314961114191480012916', 36);
  shouldSucceed('-333', '-333', 3);
  shouldSucceed('7.24707e+13', '72470760481059', 6);
  shouldSucceed('39232618.1513515442233995765535454389', '39232618.151351544223399576553545438981252', 36);
  shouldSucceed('-4e+5', '-357994', 1);
  shouldSucceed('-1.90e+4', '-18904.11335233460016293296574557643545512393801643609213933', 3);
  shouldSucceed('-6585152111956929.924309477123328984876184272828762900', '-6585152111956929.9243094771233289848761842728287629', 52);
  shouldSucceed('4.505e-7', '0.0000004505328', 4);
  shouldSucceed('-2.4125965461846e+19', '-24125965461845662271', 14);
  shouldSucceed('4.82673137e+33', '4826731373891127996812671510065700.871947701', 9);
  shouldSucceed('-6621278.2', '-6621278.1120573461544975284970826524341806671316100080257485', 8);
  shouldSucceed('-1.8015392869565386634525164264799463344376205007391000000e-7', '-0.00000018015392869565386634525164264799463344376205007391', 56);
  shouldSucceed('-0.00026465463574439280006655492609887593', '-0.00026465463574439280006655492609887592672292239588307259', 35);
  shouldSucceed('4.87815228988300090', '4.8781522898830009076096556452567', 18);
  shouldSucceed('-5.1107117199524082779077801201617e+35', '-511071171995240827790778012016163902', 32);
  shouldSucceed('1.4734242515706890557e+20', '147342425157068905574.390834406', 20);
  shouldSucceed('-4019325091848890817268596991.815200', '-4019325091848890817268596991.8152', 34);
  shouldSucceed('3.8e+14', '384715413967421', 2);
  shouldSucceed('7483444.49', '7483444.498791364040133403947480439118040376737700653', 9);
  shouldSucceed('-594538312.6255', '-594538312.625485172379', 13);
  shouldSucceed('0.00753000', '0.00753', 6);
  shouldSucceed('8.1440148247e+13', '81440148247675.27449603492606125135884', 11);
  shouldSucceed('8.444003009300e+21', '8444003009300239495556', 13);
  shouldSucceed('2308.1529840912558574923966042774800185916972327325289', '2308.1529840912558574923966042774800185916972327325289261', 53);
  shouldSucceed('2.67e+3', '2674.698673623', 3);
  shouldSucceed('-2.82819136180287470854625537e+30', '-2828191361802874708546255368471.80800005766', 27);
  shouldSucceed('518250411', '518250411', 9);
  shouldSucceed('3.2e+4', '32661.9135347256259375001777960775509', 2);
  shouldSucceed('29.15347602216416991973', '29.153476022164169919735054013077734177', 22);
  shouldSucceed('-4.611285536613066108e+30', '-4611285536613066107912600830385', 19);
  shouldSucceed('-51774110.0705144989023975360207167071143094356321', '-51774110.070514498902397536020716707114309435632036586', 48);
  shouldSucceed('-11969053.91', '-11969053.9052', 10);

  it('set Decimal.rounding to 4', () => {
    Decimal.rounding = 4;
  });

  shouldSucceed('687378946204028.408158998985701', '687378946204028.408158998985701430935094', 30, 3);
  shouldSucceed('42.452', '42.4523909443358871476552683504968536100051', 5, 3);
  shouldSucceed('-22771061110217019663705702.44170142085172', '-22771061110217019663705702.44170142085171219649140996', 40, 3);
  shouldSucceed('-1470.640309974016167512235698629586', '-1470.6403099740161675122356986295857257144815364', 34, 3);
  shouldSucceed('-1.110228e+27', '-1110227398804733429555663947.06619', 7, 3);
  shouldSucceed('-6.4898237111e+26', '-648982371105405071851661301', 11, 3);
  shouldSucceed('-4641197449469148.658850361201903', '-4641197449469148.658850361201902222', 31, 3);

  shouldSucceed('7.905300379788e+16', '79053003797878062.6454954', 13);
  shouldSucceed('-6.83490000000e-13', '-0.00000000000068349', 12);
  shouldSucceed('-62760641815.69084973661201201', '-62760641815.690849736612012010742308663', 28);
  shouldSucceed('0.000704', '0.000704496313', 3);
  shouldSucceed('82926865286287.8852357368342860830310721063079299643', '82926865286287.88523573683428608303107210630792996432', 51);
  shouldSucceed('-0.00032388272393900301214220090249', '-0.00032388272393900301214220090248744799603424908', 29);
  shouldSucceed('8.6e+12', '8621641486938.4837308885005093571508566552428700982454', 2);
  shouldSucceed('2', '2', 1);
  shouldSucceed('1.4641440117052559075e+20', '146414401170525590746.047955203899370771105088', 20);
  shouldSucceed('3511.925583', '3511.925583', 10);
  shouldSucceed('2861824.253079699095728', '2861824.253079699095727765750377038689', 22);
  shouldSucceed('-3.940097756e+10', '-39400977564.548924098664431671700066962', 10);
  shouldSucceed('-888', '-888', 3);
  shouldSucceed('-0.000302106125213724988141721256104', '-0.00030210612521372498814172125610432438685', 30);
  shouldSucceed('6943.4804552555315615809650428503', '6943.480455255531561580965042850266831249032130818358478956', 32);
  shouldSucceed('3365678', '3365678.3397481381125085749', 7);
  shouldSucceed('-5.3943374314e+19', '-53943374313769567458.386865325', 11);
  shouldSucceed('-6.67880509225510150542252852147049489938254298497979', '-6.6788050922551015054225285214704948993825429849797925563674', 51);
  shouldSucceed('1.36424e+18', '1364240644139816224.60228356028', 6);
  shouldSucceed('1.410236477950416725e+23', '141023647795041672538410.84935693266374259666015274447', 19);
  shouldSucceed('-802.817765', '-802.81776500697712984253334522', 9);
  shouldSucceed('-5.276210722424690668896260075355037218851', '-5.27621072242469066889626007535503721885096', 40);
  shouldSucceed('-0.000874209568970788', '-0.0008742095689707877849902027926289294748756775668387', 15);
  shouldSucceed('0.092053833162002', '0.09205383316200189249855864903410820435666385119723209239', 14);
  shouldSucceed('7.0656298318128209e-14', '0.0000000000000706562983181282092835675843980510112', 17);
  shouldSucceed('-8.66511516852116659e+18', '-8665115168521166587', 18);
  shouldSucceed('3.3490648464e+22', '33490648463534229842937.79268276945692333064632966129475', 11);
  shouldSucceed('-39041587174692569176.82740706154183894', '-39041587174692569176.827407061541838942655371389185', 37);
  shouldSucceed('-3834.0', '-3834', 5);
  shouldSucceed('-0.008912382644814418776268630', '-0.00891238264481441877626863', 25);
  shouldSucceed('-2.1e+5', '-206119', 2);
  shouldSucceed('4.83340000000e-8', '0.000000048334', 12);
  shouldSucceed('3.185196533675230520000000000000e-19', '0.000000000000000000318519653367523052', 31);
  shouldSucceed('6.0431217298488095562718496137220939447806000000000000000e-17', '0.000000000000000060431217298488095562718496137220939447806', 56);

  it('set Decimal.rounding to 5', () => {
    Decimal.rounding = 5;
  });

  shouldSucceed('-8e+26', '-786589693451258754942279859.3834', 1, 4);
  shouldSucceed('-26.0', '-26', 3, 4);
  shouldSucceed('-8.462226728e+11', '-846222672789.2087639320702375427266333530942524245', 10, 4);
  shouldSucceed('-4e-7', '-0.0000004019666978288041783154210868', 1, 4);
  shouldSucceed('-315609.775843992', '-315609.775843992', 15, 4);
  shouldSucceed('-3.319e+9', '-3318880945', 4, 4);
  shouldSucceed('-6', '-6.2847', 1, 4);

  shouldSucceed('-1408003897645960.648499616456', '-1408003897645960.648499616456', 28);
  shouldSucceed('-1.0', '-1', 2);
  shouldSucceed('-8.28e+14', '-827860423543649', 3);
  shouldSucceed('0.00054398953021585321711560388890', '0.00054398953021585321711560388889590290139888', 29);
  shouldSucceed('-4.409e-9', '-0.000000004408792', 4);
  shouldSucceed('4.0000e-10', '0.0000000004', 5);
  shouldSucceed('3.40e+16', '34001779327925905', 3);
  shouldSucceed('-9.03e+34', '-90332622851356543193546536340366547', 3);
  shouldSucceed('-4.5320e+16', '-45320100856429143.39155209710530673318222777', 5);
  shouldSucceed('3.618e+30', '3618328715720583671291544414202', 4);
  shouldSucceed('-1003.61140', '-1003.61139687804673322250551', 9);
  shouldSucceed('-8139415035028632370.38737', '-8139415035028632370.38736602659835', 24);
  shouldSucceed('8e+7', '83198058', 1);
  shouldSucceed('-7.99492e+14', '-799491603856548', 6);
  shouldSucceed('444', '444', 3);
  shouldSucceed('0.00000613258266938', '0.0000061325826693823067791292255878336353793864046451956723', 12);
  shouldSucceed('-554696279951718746537611.26040', '-554696279951718746537611.26040029508470430208572833137315', 29);
  shouldSucceed('446', '446.189185820662709163412845035853873', 3);
  shouldSucceed('22873128187827109553471831451.06623850867', '22873128187827109553471831451.06623850866672688842662473', 40);
  shouldSucceed('9e+5', '880389', 1);
  shouldSucceed('-6.7516118890844e+16', '-67516118890844443.625641', 14);
  shouldSucceed('-0.36107158435820', '-0.36107158435820101656696353075596201902674001080619510849', 14);
  shouldSucceed('8.958386374640407365', '8.958386374640407364828679985365339921820421370157246', 19);
  shouldSucceed('3e+2', '257', 1);
  shouldSucceed('-1.904659739878e+18', '-1904659739878060478.113131137688927604413210083841', 13);
  shouldSucceed('-0.0000627142', '-0.00006271421732891589577305487292334', 6);
  shouldSucceed('3.310541e+8', '331054103', 7);
  shouldSucceed('-1.793886e+23', '-179388600781592577147651.2641684828762234473', 7);
  shouldSucceed('0.0004600', '0.00046', 4);
  shouldSucceed('-2.9e+21', '-2906505321975413509885', 2);
  shouldSucceed('86415.94739506', '86415.9473950557683374', 13);
  shouldSucceed('6.730414', '6.7304135909152', 7);
  shouldSucceed('-5.032367e+14', '-503236749968584', 7);
  shouldSucceed('-5.0241682013868216287718e+32', '-502416820138682162877178622610283', 23);
  shouldSucceed('-0.0552606118984074172116684879479087', '-0.0552606118984074172116684879479087', 33);
  shouldSucceed('91017414629852252476380368766.471', '91017414629852252476380368766.47117955844005', 32);
  shouldSucceed('28586.32124747000', '28586.32124747000107561236523943', 16);
  shouldSucceed('0.000001935665545322534195131', '0.0000019356655453225341951305040536808235510260170838860718', 22);
  shouldSucceed('7.8', '7.803563246406851025', 2);
  shouldSucceed('-4.89914223627882382434323e+26', '-489914223627882382434323457.50920109688497974624541155867073', 24);
  shouldSucceed('384718796891211107', '384718796891211107', 18);
  shouldSucceed('42510.74002309897971230194', '42510.7400230989797123019438399853496258', 25);
  shouldSucceed('-7.388e+11', '-738804895894', 4);
  shouldSucceed('-5.0000000e-7', '-0.0000005', 8);

  it('set Decimal.rounding to 6', () => {
    Decimal.rounding = 6;
  });

  shouldSucceed('42334337596496149636254', '42334337596496149636254.4926162509306406461', 23, 5);
  shouldSucceed('-7e+9', '-7246374971.34279698356', 1, 5);
  shouldSucceed('71516263932998764871838469072', '71516263932998764871838469072.280115355524', 29, 5);
  shouldSucceed('71257489.5995227415169007618702182092', '71257489.59952274151690076187021820922744', 36, 5);
  shouldSucceed('268492835', '268492834.77041', 9, 5);
  shouldSucceed('50325.551277778107847798802', '50325.551277778107847798801525', 26, 5);
  shouldSucceed('-5.289303987e+29', '-528930398665449048343281311623.69686', 10, 5);

  shouldSucceed('0.08000', '0.08', 4);
  shouldSucceed('-4.5132e+21', '-4513243388120382069815.8508153058993058875', 5);
  shouldSucceed('-73549', '-73549.2594630551663822238', 5);
  shouldSucceed('1.275868004728922895890883e+29', '127586800472892289589088296800.6', 25);
  shouldSucceed('-0.0003715444034899460421534099962225699000', '-0.0003715444034899460421534099962225699', 37);
  shouldSucceed('-6.9625565265e+24', '-6962556526511822306135536', 11);
  shouldSucceed('1.67583703641e+13', '16758370364138.915293525076269061228714877', 12);
  shouldSucceed('-173594.95064085553515176707313947534918109631092170', '-173594.950640855535151767073139475349181096310921699', 50);
  shouldSucceed('-6.9503965525e+19', '-69503965525000308384.151383', 11);
  shouldSucceed('4.411225e+20', '441122486054080817112', 7);
  shouldSucceed('2.467044064783596937642371770e+31', '24670440647835969376423717700462.39', 28);
  shouldSucceed('3.9711897549481645654e+24', '3971189754948164565361634.8039734590476326224193520402091769', 20);
  shouldSucceed('-1.4757613208690e+21', '-1475761320868963235919.64499841336073105746686372924161', 14);
  shouldSucceed('91683083887068.6191146', '91683083887068.61911461351134520171343337804061135', 21);
  shouldSucceed('-7923074181102822.578', '-7923074181102822.5778', 19);
  shouldSucceed('-6.800e-8', '-0.000000068', 4);
  shouldSucceed('-2.57954671081460000000e-10', '-0.00000000025795467108146', 21);
  shouldSucceed('5.5352911972e-9', '0.000000005535291197169667611325365189624523452', 11);
  shouldSucceed('6.0488358e+8', '604883577', 8);
  shouldSucceed('-7.575535014e-9', '-0.00000000757553501363609536678641245355', 10);
  shouldSucceed('7.547067960578900230644488e-10', '0.00000000075470679605789002306444877998602723', 25);
  shouldSucceed('-3.64561456763e+12', '-3645614567625.4', 12);
  shouldSucceed('9.0e-7', '0.0000009', 2);
  shouldSucceed('7e+2', '687', 1);
  shouldSucceed('517277827334839.8174848543680868', '517277827334839.8174848543680868015165926618', 31);
  shouldSucceed('7e+2', '655.46270361324473194', 1);
  shouldSucceed('1632131488313153.49737424823493573157', '1632131488313153.497374248234935731568', 36);
  shouldSucceed('274068317992.5998880719845028748169734442', '274068317992.5998880719845028748169734442394151076', 40);
  shouldSucceed('-7.060e-9', '-0.00000000706025531009734073', 4);
  shouldSucceed('0.004444', '0.0044439457493', 4);
  shouldSucceed('72482770689153111154104782082.023', '72482770689153111154104782082.022764082943227214833851', 32);
  shouldSucceed('5.9130694036072794206e+24', '5913069403607279420613864.152', 20);
  shouldSucceed('843384561300245347961437.966', '843384561300245347961437.96592523791', 27);
  shouldSucceed('0.0000035198821282510000000', '0.000003519882128251', 20);
  shouldSucceed('-1.00371560130267706870097e-9', '-0.00000000100371560130267706870096885251', 24);
  shouldSucceed('17504218.4970302', '17504218.49703016415913667026121376499', 15);
  shouldSucceed('-5e-9', '-0.000000005169058703', 1);
  shouldSucceed('6.922803246e+10', '69228032455', 10);
  shouldSucceed('-16', '-16', 2);
  shouldSucceed('-1.355147513468192707127939151e+40', '-13551475134681927071279391508441439066206.58705380600075', 28);
  shouldSucceed('81670324.1197758695', '81670324.1197758695212865075629796973196504241126', 18);
  shouldSucceed('0.00005', '0.00004797485174640366805332660647', 1);
  shouldSucceed('-4.864397594e-10', '-0.0000000004864397594461335282648538530108953965681345', 10);
  shouldSucceed('47694105.2312532', '47694105.23125322528167211284521303', 15);
  shouldSucceed('-4.962106181e+26', '-496210618135432953927871636.779236', 10);
  shouldSucceed('1.2800030559497062236642e+37', '12800030559497062236641930592334626609.7332', 23);
  shouldSucceed('-574830783.7', '-574830783.6689168903917696583746514637433390929', 10);
  shouldSucceed('5969.431086199057470', '5969.43108619905746956015212970904111744101', 19);
  shouldSucceed('-4.8e+3', '-4814.32904953003285', 2);
  shouldSucceed('4.297e+16', '42973001760252134', 4);
  shouldSucceed('-5.7628e+6', '-5762846.590152347665179652381407653797146356303622218259885', 5);
  shouldSucceed('904864662232032.160612401810317927291657403142932', '904864662232032.16061240181031792729165740314293194205879163', 48);
  shouldSucceed('7.9892e+20', '798923115068265241915.537619430376605', 5);
  shouldSucceed('-8.97759349384000643', '-8.97759349384000643427096282979', 18);

  shouldSucceed('123.45', '12.345e1');

  shouldFail(1.23, '3');
  shouldFail(1.23, new Decimal(3));
  shouldFail(1.23, null);
  shouldFail(1.23, NaN);
  shouldFail(1.23, 'NaN');
  shouldFail(1.23, []);
  shouldFail(1.23, {});
  shouldFail(1.23, '');
  shouldFail(1.23, ' ');
  shouldFail(1.23, 'hello');
  shouldFail(1.23, '\t');
  shouldFail(1.23, new Date());
  shouldFail(1.23, new RegExp());
  shouldFail(1.23, 2.01);
  shouldFail(1.23, 10.5);
  shouldFail(1.23, '1.1e1');
  shouldFail(1.23, true);
  shouldFail(1.23, false);
  shouldFail(1.23, () => {});
  shouldFail(1.23, '-1');
  shouldFail(1.23, -23);
  shouldFail(1.23, 1e9 + 1);
  shouldFail(1.23, 0);
  shouldFail(1.23, '-0');
  shouldFail(1.23, 0.9);
  shouldFail(1.23, '-1e-1');
  shouldFail(1.23, Infinity);
  shouldFail(1.23, '-Infinity');

  shouldFail(1.23, 1, '3');
  shouldFail(1.23, 1, new Decimal(3));
  shouldFail(1.23, 1, null);
  shouldFail(1.23, 1, NaN);
  shouldFail(1.23, 1, 'NaN');
  shouldFail(1.23, 1, []);
  shouldFail(1.23, 1, {});
  shouldFail(1.23, 1, '');
  shouldFail(1.23, 1, ' ');
  shouldFail(1.23, 1, 'hello');
  shouldFail(1.23, 1, '\t');
  shouldFail(1.23, 1, new Date());
  shouldFail(1.23, 1, new RegExp());
  shouldFail(1.23, 1, 2.01);
  shouldFail(1.23, 1, 10.5);
  shouldFail(1.23, 1, '1.1e1');
  shouldFail(1.23, 1, true);
  shouldFail(1.23, 1, false);
  shouldFail(1.23, 1, () => {});
  shouldFail(1.23, 1, '-1');
  shouldFail(1.23, 1, -23);
  shouldFail(1.23, 1, 9);
  shouldFail(1.23, 1, '-0');
  shouldFail(1.23, 1, 0.9);
  shouldFail(1.23, 1, '-1e-1');
  shouldFail(1.23, 1, Infinity);
  shouldFail(1.23, 1, '-Infinity');
});
