import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

// Supabase istemcisi
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Sadece POST desteklenir" });

  try {
    const { musteriAdi, aracModel, baslangicTarihi, bitisTarihi, fiyat } = req.body;

    const fileName = `sozlesme-${uuidv4()}.pdf`;
    const tempPath = path.join(os.tmpdir(), fileName);
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // OpenSans fontu
    const fontPath = path.join(process.cwd(), "fonts", "OpenSans-Regular.ttf");
    doc.font(fontPath);

    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    // Başlık
    doc.fontSize(14).text("ARAÇ KİRALAMA SÖZLEŞMESİ", { align: "center" }).moveDown(1.5);
    doc.fontSize(10);

    // Müşteri alanları boş
    doc.text("Kiracı Unvanı: ...............................................................");
    doc.text("Kiracı Adresi: ...............................................................");
    doc.text("Kiracı Vergi Dairesi - Vergi Numarası: ................................");
    doc.text("Fatura Bildirim e-posta adresi: ...........................................");
    doc.text("Kiracı Kısa İsmi: 'MÜŞTERİ'").moveDown();

    // Tam metni doğrudan gömülü olarak yerleştiriyoruz
    const fullText = `ARAÇ KİRALAMA SÖZLEŞMESİ
Bu sözleşme (“ARAÇ KİRALAMA SÖZLEŞMESİ”) aşağıda belirtilen taraflar arasında akdedilmiştir:

TARAFLAR
Kiralayan Unvanı: Lena Mama Yayıncılık Ticaret A.Ş. (MALİK-KİRALAYAN sıfatı ile)
Kiralayan Adresi: Eyüp Sultan Mah. Yadigâr Sk. No: 30-38A İç Kapı No:78 Sancaktepe/İSTANBUL
Kiralayan Vergi Dairesi - Vergi Numarası: Sultanbeyli - 6081253500
Fatura Bildirim e-posta adresi: info@LENACARS.com
Kiralayan Kısa İsmi: 'LENACARS'
...


2)	Tanımlar


Araç	Sipariş Onay Formu’nda markası, modeli ve teknik özellikleri belirtilmiş olan Aracı/Araç’ları, bütün bileşen parçaları, aksesuarları,
eklemeleri, değişiklikleri ve değiştirme parçaları ile birlikte ifade eder.
Araç Siparişi	Sipariş Onay Formu’nun Müşteri tarafından imzalanarak, LENACARS’a teslim edilmesini ifade eder.

Araç Teslim Tutanağı	Aracın MÜŞTERİ tarafından teslim alındığı sırada MÜŞTERİ’nin imzalayarak LENACARS ve/veya yetkili temsilcisine teslim ettiği tutanağı ifade eder.
Kilometre Aşım Ücreti	Sözleşmede yer alan kilometre limitini aşan her kilometre için kilometre başına ücret olarak Sipariş Onay Formu’nda belirtilen tutarı ifade eder.

Fiili Kilometre	Aracın kilometre sayacında gösterilen kilometre değerini veya kilometre sayacının bozuk olduğu herhangi bir süre için Madde 13.3’e
uygun olarak mutabık kalınan kilometreyi ifade eder.

Kilometre Aşımı	Kira Süresi’nin sonunda Fiili Kilometre’nin Sipariş Onay Formu’nda belirtilen Sözleşme Kilometresi üst sınırını aşması halinde, ikisi
arasındaki fark “Kilometre Aşımı” olarak değerlendirilir.
Kira Ücreti	Sipariş Onay Formu’nda belirtilen, MÜŞTERİ’ye fatura edilen aylık Araç kira bedelini ifade eder.


Kira Süresi	Aracın, fiilen MÜŞTERİ’ye teslim edildiği veya Teslimat Bildirimi’nin MÜŞTERİ’ye gönderildiği tarihten itibaren başlayan ve Sipariş Onay Formu’nda belirtilen kiralama süresini ifade eder. Öncül Araç tedarik edildiği hallerde Öncül Aracın kullanım süresi bu sürenin hesabına dâhil edilmeyecektir.

Öncül Araç	İşbu Sözleşme akdedildiği sırada MÜŞTERİ tarafından talep edilen Aracın tedarikçiden ve/veya ithalat işlemlerinden kaynaklanan
sebeplerle	temin	edilememesi	durumunda MÜŞTERİ’nin talebi üzerine geçici olarak sunulan Aracı ifade eder.
 



Sipariş Onay Formu	İşbu Sözleşme’nin Eki olarak, Aracın ayrıntılarını, Kira Süresi’ni, ve Sözleşme Kilometresi’ni, Kilometre aşım ücretlerini, Araç’la birlikte verilecek hizmetleri ve LENACARS’ın fiyat teklifi dâhil Kira Ücretlerini de belirten ve MÜŞTERİ’nin yetkilileri ve varsa kefiller tarafından imzalanmış olan belge olup işbu Sözleşme’nin ayrılmaz bir
parçası ve Taraflar açısından tam olarak bağlayıcıdır.
Sözleşme
Kilometresi	Sipariş Onay Formu’nda belirtilen kilometre değerini ifade eder.
Teslimat Bildirimi	Aracın	teslime	hazır	olduğuna	ilişkin	LENACARS	tarafından
MÜŞTERİ’ye yapılan bildirimi ifade eder.


Yıpranma Masrafları	İade edilen Aracı orijinal görünümüne, düzgün işleyiş ve temizlik konumuna getirmek için gerekli olan karoseri, camlar, farlar, lastikler, mekanik, koltuklar üzerinde gözlemlenen hasarların tamirine, boyamaya ve/veya reklam afişlerinin sökülmesine bağlı yıpranmalara ilişkin ve Sözleşme süresince ihbar edilmemiş, zabıtları
tutulmamış, sigorta şirketlerinden tazmin edilemeyecek veya teslim tarihi itibariyle edilmemiş hasarlara ilişkin tüm masrafları ifade eder.
ATKS	Araç Takip ve Kullanıcı Skorlama Sistemi


3)	 Araçların Kiralanması ve Teslimi

3.1	LENACARS, bu Sözleşme’nin şartlarına uygun olarak, Sipariş Onay Formu’nda belirtilen Araçları MÜŞTERİ’ye kiraya vermeyi ve MÜŞTERİ de söz konusu Araç’ları kiralamayı kabul etmektedir. Her Sipariş Onay Formu, işbu Sözleşme’nin eki ve ayrılmaz bir parçasıdır. MÜŞTERİ, söz konusu Sipariş Onay Formu’nun her hal ve şartta MÜŞTERİ’nin temsil ve ilzama yetkili temsilcileri tarafından imzalanacağını, işbu imza yükümlülüğüne ilişkin her türlü sorumluluğun kendisine ait olduğunu ve bu husustaki itiraz haklarından peşinen feragat ettiğini kabul, beyan ve taahhüt etmiştir.

3.2	Sipariş Onay Formu imzalandığı tarihten itibaren işbu Sözleşme teşekkül etmiş olup MÜŞTERİ, ilgili siparişi iptal edemez ve sipariş etmiş olduğu kiralayan iradesi dışında Aracı/Araç’ları değiştiremez. Eğer MÜŞTERİ, Sipariş Onay Formu’nu imzaladığı tarihten sonra herhangi bir zamanda Sipariş Onay Formu’nda belirtilen Araç Siparişi’ni iptal eder veya değiştirilmesini talep ederse, söz konusu Sipariş Onay Formunun iptal edildiği kabul edilir. Bu durumda MÜŞTERİ, Sipariş Onay Formu’nda belirtilen aylık kiralama ücreti üzerinden aylık KDV dâhil 6 Kira Ücreti’ni LENACARS’a nakden veya defaten ödeyecektir. Araç üzerinde MÜŞTERİ talebi ile yapılan değişiklik, modifikasyon masrafları MÜŞTERİ tarafından ayrıca ödenecektir. MÜŞTERİ Sipariş Onay Formunun iptali sebebiyle yukarıda belirtilen aylık KDV dâhil kira tutarını, LENACARS’ın bu tutara ilişkin düzenleyeceği fatura tarihini takip eden (5) gün içerisinde nakden/hesaben ve defaten ödeyeceğini kabul etmiştir.

3.3	MÜŞTERİ, LENACARS tarafından kendisine Aracın teslim edileceğine ilişkin bildirimin yapılmasını müteakip (2) gün içerisinde Aracı teslim alacaktır. MÜŞTERİ, bu bildirimin yapıldığı takip eden 2.günün sonu itibariyle kira süresinin başladığını, söz konusu süre içerisinde Aracı teslim almaması halinde, Aracın teslim alınmadığı süre için LENACARS tarafından fatura düzenlenebileceğini bildiğini ve ortaya çıkacak Kira Ücreti’ni Sözleşme hükümlerine uygun olarak ödeyeceğini kabul, beyan ve taahhüt etmiştir.

3.4	MÜŞTERİ, teslimat sırasında Aracı incelemek zorundadır. Eğer Araç herhangi bir şekilde hasarlıysa veya Sipariş Onay Formu’nda belirtilen Araç özelliklerine uymuyorsa, bu halde MÜŞTERİ Aracın teslimini kabul etmemeli ve Araç tesliminin reddedildiğini reddedilme gerekçesi ile birlikte derhal LENACARS’a yazılı olarak bildirmelidir. Aracın MÜŞTERİ tarafından teslim alınmasından sonra, MÜŞTERİ’nin veya MÜŞTERİ temsilcisinin Araç Teslim Belgesi üzerindeki imzası, MÜŞTERİ’nin Aracı Sipariş Onay Formu’nda belirtildiği şekilde iyi durumda teslim aldığına, incelediğine, görülebilir hiçbir ayıbı olmadığına ve Aracı kabul ettiğine ilişkin nihai kanıtı oluşturacaktır. 
3.5	Aracın MÜŞTERİ veya MÜŞTERİ temsilcisi tarafından teslim alınmasıyla Aracın fiili hâkimiyeti MÜŞTERİ’ye geçmiş olup bu andan itibaren MÜŞTERİ “İşleten” sıfatını haiz olacaktır. 

3.6	İşbu Sözleşme akdedildiği sırada MÜŞTERİ tarafından talep edilen Aracın tedarikçiden ve/veya ithalat işlemlerinden kaynaklanan herhangi bir sebeple temin edilememesi durumunda Aracın temin edilerek MÜŞTERİ’ye teslimine kadar geçecek süre için MÜŞTERİ’nin yazılı talebi üzerine bir Öncül Araç temin edilebilir. MÜŞTERİ, öngörülemeyen herhangi bir maliyetin/sorunun ortaya çıkması durumunda LENACARS’ın Kira Ücreti’ni bu kapsamda revize edebileceğini, Sözleşme’yi süre vermeksizin ve herhangi bir tazminat ödeme yükümlülüğü bulunmaksızın feshedebileceğini kabul, beyan ve taahhüt etmiştir. Kira Ücreti’nin LENACARS tarafından revize edilmesi halinde MÜŞTERİ, revize edilmiş olan Kira Ücreti’ni 5. maddede belirlenmiş koşullarla LENACARS’a ödemeyi kabul ve taahhüt etmiştir. Sözleşme’nin LENACARS tarafından işbu madde hükmünce fesih edilmesi halinde MÜŞTERİ Öncül Aracı, feshi müteakiben (1) gün içerisinde, teslim aldığı şekilde LENACARS’a teslim edecektir.

3.7	Taraflar Öncül Aracın kira ücretinin, Aracın Kira Ücreti’nden fazla olabileceği hususunda mutabakat sağlamış olup MÜŞTERİ işbu hususu peşinen kabul etmiştir.

3.8	Öncül Araç için kış lastiği tedarik edilmeyecek olup sağlanacak operasyonel hizmetler tamamen tedarikçinin taahhüt ettiği hizmetler ile sınırlıdır. LENACARS’ın bu hususta sorumlu tutulması mümkün değildir. Müşteri tarafından talep edilmesi halinde LENACARS tarafından belirtilecek ücret karşılığında kış lastiği tedarik edilecektir. Kış lastiği bulunmaması dolayısıyla yaşanacak kaza, oluşacak zarar, ziyan konusunda MÜŞTERİ sorumludur. Oluşacak zarar MÜŞTERİ tarafından ödenecektir.  

3.9	MÜŞTERİ, Aracı teslim almasını müteakiben, (1) gün içerisinde, Öncül Aracı teslim aldığı şekilde LENACARS’a teslim edecektir. Teslim borcunun ifa edilmiş sayılması için, Öncül Aracın LENACARS tarafından belirlenecek ve MÜŞTERİ’ye bildirilecek olan adreste, geçerli bir teslim tesellüm belgesi imzalanması kaydıyla teslim edilmiş olması şarttır. Aksi takdirde MÜŞTERİ, Öncül Aracın İstanbul’a ve/veya LENACARS’ın belirlediği adrese nakil masraflarını, sair tüm masraflar ve Öncül Aracın günlük kira ücretinin iki katı oranında kira ücreti ile birlikte derhal nakden ve defaten LENACARS’a ödemekle yükümlüdür.

3.10	Öncül Aracın kira ücreti, kullanıldığı dönemin sonunda Öncül Aracın tedarik edildiği şirket tarafından LENACARS adına düzenlenecek faturada belirtilecek olup, söz konusu ücrete ilişkin LENACARS tarafından MÜŞTERİ’ye fatura düzenlenecektir. MÜŞTERİ işbu faturayı 4. maddede belirlenmiş koşullarla LENACARS’a ödemeyi kabul ve taahhüt etmiştir.

4)	 Kira Ücreti’nin ve Diğer Ücretlerin Ödenmesi

4.1	Kira Ücreti’ne ilişkin ilk fatura, Kira Süresi’nin başlangıç tarihinden itibaren ilgili ayın son gününe kadarki dönemi kapsayacak şekilde ay sonuna kadar kalan gün sayısı üzerinden hesaplanarak düzenlenir. Takip eden her ay için Kira Ücreti’ne ilişkin faturalar her ayın ilk günü düzenlenecek olup MÜŞTERİ’ye gönderilecektir. MÜŞTERİ’nin yazılı talebi olması ve faturanın gönderileceği e-posta adresini bu yazılı talepte açıkça belirtmesi kaydı ile söz konusu faturalar MÜŞTERİ’ye e-posta iletisi olarak da gönderilebilecektir. MÜŞTERİ, bildirdiği e-posta adresinde meydana gelen ve LENACARS’a derhal bildirilmeyen değişiklikler dolayısı ile meydana gelebilecek aksaklıklardan ve gecikmeden sorumlu olduğunu kabul etmektedir. MÜŞTERİ, Kira Ücreti’ni, (5) gün içerisinde nakden/hesaben ve defaten ödeyeceğini kabul, beyan ve taahhüt etmiştir. Katma Değer Vergisi oranındaki herhangi bir artış veya düşüş yürürlüğe giriş tarihi itibariyle Kira Ücretleri’ne yansıtılacaktır.
4.2	Bu Sözleşme’nin şartları çerçevesinde LENACARS tarafından Kira Ücreti haricinde MÜŞTERİ’ye fatura edilebilecek bütün diğer meblağlar, ilgili fatura tarihini takip eden (5) gün içerisinde ödenecektir. 
4.3	Ödemelerin, işbu Sözleşme’nin 4.1,ve 4.2 maddelerinde belirtilen şartlara uygun olarak yapılmaması halinde, LENACARS, ayrıca bir bildirimde bulunmaksızın fatura bedeli üzerinden fatura tarihinden itibaren fiili ödeme tarihine kadar, ödemenin yapıldığı para cinsine göre mevduata uygulanan azami mevduat faizlerinin (TCMB tarafından ilan edilen veya 3 büyük bankanın mevduat faizi ortalaması esas alınarak) üç katı üzerinden hesaplanacak gecikme faizini uygulayacak, bu faiz miktarına ilişkin ayrıca MÜŞTERİ’ye bir vade farkı faturası düzenleyecek ve bu bedel fatura tarihini takip eden (5) gün içerisinde nakden/hesaben ve defaten ödenecektir.

4.4	MÜŞTERİ, işbu Sözleşme’nin 4.1,ve 4.2 maddelerinde belirtilen şartlara uygun olarak ödeme yapmaması, ödemelerini iki defa geciktirmesi durumunda (Sözleşmede yazılı olan ödeme gününde ödeme yapılmadığı takdirde müşteri ödemede gecikmiş temerrüde düşmüş olarak kabul edilir) LENACARS MÜŞTERİ ile olan sözleşmesini haklı nedene dayanarak herhangi bir ihtar ve uyarıya gerek kalmaksızın tek taraflı olarak fesih edebilir. Böyle bir durumda MÜŞTERİNİN sözleşmede yazılı olan mail adresine e-posta yolu ile araç/araçları teslim etmesi gerektiği sadece bilgilendirme amaçlı olarak bildirilecek ve araç/araçlar LENACARS’a başkaca hiçbir ihtar ve uyarıya gerek kalmadan iade edilecektir. Sözleşmenin LENACARS tarafından tek taraflı feshi halinde kalan kiralama bedelleri, varsa trafik cezaları, HGS, köprü, otoyol geçiş ücretleri, araçtaki hasar ve oluşabilecek diğer tüm zarar, ziyan, kar kaybı vs her ne isim altında olursa olsun MÜŞTERİ tarafından karşılanacaktır.

4.5	Araç tescili de dâhil olmak üzere Sipariş Onay Formu tarihi itibari ile geçerli olan her türlü harç ve vergi Kira Ücreti içerisinde yer almaktadır. MÜŞTERİ, kamu otoritesi tarafından konulan ve Sözleşme’nin ve/veya Sipariş Onay Formu’nun imzalanması tarihinden sonra yürürlüğe girecek her türlü vergi, resim, harç ile mevcut vergi, resim, harçlarda her ne nam altında olursa olsun meydana gelecek her türlü artış, hesaplama değişikliği, yeni bir vergi salınması dâhil bunlarla sınırlı olmamak üzere LENACARS’ın maliyetlerinde artışa sebep olabilecek her türlü yeni ve/veya ek maliyeti LENACARS’a ödeyeceğini kabul, beyan ve taahhüt etmiştir. Söz konusu yeni ve/veya ek maliyet LENACARS tarafından Kira Ücreti’ne yansıtılacak ve MÜŞTERİ tarafından Sözleşme hükümlerine uygun olarak LENACARS’a ödenecektir.

4.6	MÜŞTERİ’nin borçlarını 4. maddede düzenlenen süre ve şartlara uygun olarak ödememesi halinde; LENACARS, MÜŞTERİ’den gecikme tarihinden sonra, hangi kayıtla olursa olsun tahsil edilen tutarları, MÜŞTERİ’ye hitaben düzenlenmiş ve bedeli ödenmemiş en önceki tarihli faturadan başlayarak mahsup etme hakkına sahiptir. MÜŞTERİ, LENACARS’ın bu şekilde yapacağı mahsup işlemine itiraz etme hakkından vazgeçmiştir.

5)	Aracın Mülkiyeti ve Devir Yasağı

Bu Sözleşme’ye konu Araç’ların mülkiyeti LENACARS’a ait olup, hiçbir şekil ve surette MÜŞTERİ tarafından mülkiyet iddiasında bulunulamaz. MÜŞTERİ, işbu Sözleşme’yi ve Sözleşme’den doğan hak ve yükümlülüklerini LENACARS’ın yazılı muvafakati olmaksızın hiçbir şekil ve surette üçüncü bir kişiye devir edemez. MÜŞTERİ, Aracı her ne nam altında olursa olsun üçüncü şahıslara kiralayamaz ve devir edemez.

6)	 MÜŞTERİ’nin Hak ve Yükümlülükleri

6.1	MÜŞTERİ, Aracı sadece MÜŞTERİ tarafından gerçekleştirilen ticari faaliyet amacı doğrultusunda mevzuata uygun, dikkatli, temiz ve doğru bir şekilde kullanmayı kabul, beyan ve taahhüt etmiştir. MÜŞTERİ, işbu maddedeki yükümlülüğü doğrultusunda, Aracı olağan şehir yollarındaki kullanım haricinde şantiye, inşaat, asfalt yapımı ve bunlarla sınırlı olmamak üzere temizlenmesi ve/veya eski haline getirilmesi zor olacak ve/veya mümkün olmayacak şekillerde ve yerlerde kullanması halinde Aracın bedelindeki eksilmelerden ve eski haline getirilmesine dair LENACARS tarafından yapılacak giderlerden sorumlu olduğunu kabul, beyan ve taahhüt etmiştir. MÜŞTERİ, Aracı ticari faaliyetleri doğrultusunda kullanacağı için 6502 sayılı Tüketicinin Korunması Hakkında Kanun’a tabi olmadığını kabul, beyan ve taahhüt etmiştir.

6.2	Araç’lar, MÜŞTERİ’nin bordrolu çalışanları ve birinci derece yakınları tarafından kullanılabilir. İşbu halde, MÜŞTERİ birinci derece yakınları ve çalışanlarının da Aracı işbu Sözleşme’de belirlenen tüm düzenlemelere uygun şekilde kullanmasından bizzat sorumlu olduğunu kabul, beyan ve taahhüt etmiştir. Kiralama başlangıcında, araçları kullanması muhtemel kişilere ilişkin sürücü bilgileri ve ehliyetleri MÜŞTERİ tarafından LENACARS’a gönderilecektir. Araçları kullanan personelde meydana gelen değişiklikler de LENACARS’a bildirilecektir.

6.3	MÜŞTERİ, Aracı kullanan çalışanlarının veya birinci derece yakınlarının, ihmal ve her türlü kusurundan doğacak zararlardan Aracın kullanıcısı ile birlikte müteselsilen sorumlu olduğunu kabul, beyan ve taahhüt etmiştir.

6.4	Müşteri, Aracı kullanmak için 4925 sayılı Karayolları Taşıma Kanunu, Karayolları Taşıma Yönetmeliği, 2918 sayılı Karayolları Trafik Kanunu ve Karayolları Taşımacılık Faaliyetleri Mesleki Yeterlilik Eğitimi Yönetmeliği dâhil ancak bunlarla sınırlı olmamak üzere T.C.’de yürürlükte bulunan ilgili tüm mevzuat hükümleri çerçevesinde zorunlu kılınan ehliyet, faaliyet yetki belgeleri ve diğer benzeri tüm belgeleri usulüne uygun şekilde temin etmeyi, Aracı herhangi bir surette usulüne uygun ve geçerli belgeler olmaksızın kullanmamayı ve kullandırtmamayı kabul, beyan ve taahhüt etmiştir. Bu belgelerin temin edilmesi ve kolluk kuvvetlerinin talebinde ibraz edilmesi sorumluluğu MÜŞTERİ’ye aittir. Mevzuatta meydana gelebilecek herhangi bir değişiklik nedeniyle faaliyet yetki belgesi ve diğer benzeri tüm belgelerin kullanılamaz ve/veya geçersiz hale gelmesi durumunda her türlü sorumluluk MÜŞTERİ’ye ait olacak olup bu hususlara ilişkin olarak LENACARS’a herhangi bir sorumluluk atfedilmesi mümkün değildir. LENACARS, MÜŞTERİ’ye Aracı teslim ettikten sonra Aracın muhtemel kullanım amacını araştırmak veya bilmek mükellefiyeti altında değildir. MÜŞTERİ Aracın işleteni sıfatıyla, kendi kullanım amacı doğrultusunda gerekli izinleri kendisi temin edecek ayrıca Aracın kullanım amacı çerçevesinde kamu otoritelerinin özel düzenlemeleri ve/veya sair mevzuat ile getirilecek olan yükümlülükleri bizzat yerine getirecektir. Kamu otoritesi tarafından kiralama konusu edilecek Araç’ların kullanılması için getirilebilecek kış lastiği kullanılması ve bununla sınırlı olmamak üzere dönemsel her türlü zorunluluğun yerine getirilmesi sorumluluğu da MÜŞTERİ’ye ait olacaktır. Bu hükme aykırılık dolayısıyla MÜŞTERİ, LENACARS’ın uğrayabileceği her türlü zarar ve ziyandan, ayrıca ilgili mevzuat kapsamında kendi faaliyet konusu doğrultusunda yetki belgelerine sahip olmamak kamu otoritelerinin özel düzenlemeleri ve/veya sair mevzuat ile yükümlülüklere aykırı davranmak sebebiyle LENACARS’ın uğrayacağı zararlardan, doğabilecek her türlü yaptırımlardan, bu yaptırımlar dolayısıyla Aracın kullanımından mahrum kalmasından ve kendi uhdesinde kalan diğer zararlardan münhasıran sorumlu olacak ve bu hususta LENACARS’a rücu hakkı olmayacaktır. MÜŞTERİ istendiğinde ilgili belgeleri LENACARS’a derhal sunmakla yükümlüdür.

6.5	MÜŞTERİ, Aracı kullanan kişinin, MÜŞTERİ’nin çalışanı ve/veya birinci derece yakını olmayan üçüncü bir kişi olması halinin sözleşmeye aykırılık teşkil edeceğini, bu durumun sigorta teminatı dışında olduğunu, bu tür durumlar nedeniyle doğabilecek maddi ve manevi zarar ve ziyanı tüm ferileri ile birlikte LENACARS’a ödemeyi kabul, beyan ve taahhüt etmiştir.

6.6	LENACARS, kiralanan araçlar için HGS etiketini satın alır, etiket bedeli ile dolum bedelleri + KDV’yi MÜŞTERİ ya fatura eder. HGS cihazlarının ekstrelerini aylık olarak kontrol eder, kullanım tutarı kadar fatura eder. LENACARS yukarıda anılan hizmet bedeli için aylık araç başı 50 TL+KDV HGS takip ve yönetim bedeli MÜŞTERİ’ye fatura edecektir. HGS kullanımı ile alakalı kaçak geçiş cezaları ise MÜŞTERİ’ye aittir. MÜŞTERİ’ye OGS sistemine ait gerekli etiket veya cihaz verilecek ve geçiş bedellerinden ve cezalarından MÜŞTERİ sorumlu olacaktır. Ücretli yollar veya köprüler Karayolları Genel Müdürlüğü kapsamında bulunsun veya bulunmasın iş bu sözleşmeye bağlı araç kullanımından kaynaklanan geçiş ücreti ve kaçak geçiş cezalarından MÜŞTERİ sorumludur. 

6.7	Araçların plakalarına, LENACARS logosunun, adres ve telefonlarının bulunduğu çıkartmaların yapıştırılması zorunludur. Söz konusu plaka çıkartmalarının araçlar üzerinden sökülmesi veya başkaca yetkili servis, rent a car şirketi veya bayi logosunun, adres veya telefonlarının plaka altlıklarına yapıştırılması sözleşmeye aykırılık teşkil edecek olup, bu durumda LENACARS sözleşme genel hükümlerine uygun olarak ihtarname sürecini başlatabilecektir. Ayrıca araçlarla birlikte MÜŞTERİ’ye teslim edilen zorunlu trafik sigorta poliçelerinin muhafaza edilmesi MÜŞTERİ’nin sorumluluğunda olup, kaybedilmesi halinde doğacak olan masraflar ve/veya aracın bu sebeple trafikten men edilmesi ile alakalı sorumluluk MÜŞTERİ’yeaittir.

6.8	MÜŞTERİ, Karayolları Trafik Kanunu, gümrük yasaları ve ateşli silahlara ilişkin mevzuat başta olmak üzere, Türkiye Cumhuriyeti mevzuat hükümlerine aykırılık teşkil edecek şekilde ve/veya söz konusu yasal hükümler çerçevesinde taşınması suç olarak kabul edilen eşyaların Araç’ta taşınmayacağını veya taşınması özel veya resmi mercilerin iznine tabi olan eşyaların söz konusu izinler olmaksızın Araç’ta taşınmayacağını kabul, beyan ve taahhüt etmiştir.

6.9	MÜŞTERİ, Aracı, sürücü eğitimi, yarış, tempo aracı, hız denemeleri veya başka spor müsabakaları için kullanmayacağını ve kullanılmasına izin vermeyeceğini kabul, beyan ve taahhüt etmiştir.

6.10	MÜŞTERİ, Aracı, LENACARS’ın önceden yazılı onayını almaksızın Türkiye Cumhuriyeti sınırları ve sigorta hükümlerinin dışında kullanmamayı ve kullandırtmamayı, kabul, beyan ve taahhüt etmiştir. MÜŞTERİ, bu madde hükmüne aykırı davranması nedeniyle LENACARS nezdinde oluşacak tüm zararları karşılamayı kabul, beyan ve taahhüt etmiştir.

6.11	MÜŞTERİ, Aracın bütün sürücülerine Aracı ilaç, alkol veya karar verme yetisini ve reflekslerini olumsuz etkileyebilecek başka maddeler alarak kullanamayacaklarını yazılı olarak bildirecektir. MÜŞTERİ, işbu maddede belirtilen yükümlülüğünü yerine getirmediği takdirde ve/veya Aracı kullanan kişilerin bu madde hükmünü yerine getirmemeleri halinde doğacak zararlardan kendisinin Aracı kullanan kişiler ile birlikte müteselsilen sorumlu olduğunu kabul, beyan ve taahhüt etmiştir.

6.12	MÜŞTERİ, Araç’a ruhsatnamesinde izin verilenden fazla yük koymayacak ve insan taşımayacak veya Araç’a fazla yükleme yapılmasına ve insan taşınmasına izin vermeyecek, Türkiye Cumhuriyeti’nde yürürlükte olan mevzuat hükümlerine göre taşınması yasak edilen yükleri taşımayacak, taşınmasına izin vermeyecektir. Aksi halde oluşacak zararlardan MÜŞTERİ bizzat sorumlu olacaktır. 

6.13	MÜŞTERİ, LENACARS’ın önceden yazılı izni olmaksızın Araç’a alarm, immobilizer ve cep telefonları dışında herhangi bir aksesuar takmayacak, taktırmayacak veya Aracın içinde veya dış cephesinde logo, reklam ve giydirme işlemleri dahil herhangi bir değişiklik yapmayacaktır. İzinsiz takılan aksesuarlar için üretici veya distribütör firmanın sağlamış olduğu garanti hakkının kaybedilmesi halinde oluşan zarara ilişkin MÜŞTERİ’ye fatura düzenlenecektir. Araç, Kira Süresi’nin bitmesi veya işbu Sözleşme’nin feshedilmesi nedeniyle LENACARS’a iade edilirken, masrafları MÜŞTERİ tarafından karşılanmak üzere Aracın üzerine LENACARS’ın onayı ile takılmış olan aksesuarları (telefon antenleri hariç) ve Araç üzerine uygulanan logo ve sair reklamları çıkaracak ve Aracı söz konusu eklemeler yapılmadan önceki durumuna geri döndürecektir. Eğer Araç söz konusu aksesuarlar ile logo ve reklamların çıkarılması nedeniyle kabul edilemez şekilde hasarlı olarak iade edilirse, LENACARS Aracın eski haline getirilmesiyle ilgili bütün masraflara ilişkin MÜŞTERİ’ye fatura düzenleyecektir. MÜŞTERİ bu faturayı tebliğ aldığı tarihten itibaren (5) gün içerisinde söz konusu tutarı LENACARS’a nakden/hesaben ve defaten ödeyecektir. Araç’lar üzerinde uygulanacak logo, reklam ve giydirme işlemleri dolayısı ile doğabilecek vergi ve harçlardan MÜŞTERİ sorumlu olacaktır.

6.14	Aracın trafik mevzuatı dahilinde zorunlu kılınan fiziki kontrolü gerektiren her türlü muayenesi (fenni muayene, egzoz muayene, emisyon ölçümü v.b.) resmi giderleri LENACARS’a ait olmak üzere bizzat MÜŞTERİ tarafından gerçekleştirilecektir. MÜŞTERİ söz konusu muayenelerin gerçekleştirmesinden sonra ödendi belgelerini, muayenenin yapıldığına dair muayene kaşeli ruhsat fotokopisini, egzoz pulu fotokopisini v.b. resmi belgeleri LENACARS’a, muayenelerin tamamlanmasını takiben (5) gün içerisinde gönderecektir. LENACARS bu masrafları nakden/hesaben ve defaten MÜŞTERİ hesabına ödeyecek ve/veya karşılıklı cari hesaplardan mahsup edecektir. Belirtilen muayenelerin yaptırılmaması veya usulüne uygun şekilde gerçekleştirilmemesi durumunda doğacak her türlü sorumluluk MÜŞTERİ’ye ait olacaktır.

6.15	LENACARS’ın veya LENACARS’ın temsilcisinin MÜŞTERİ’ye önceden haber vermek kaydı ile iş saatleri dâhilinde Aracı inceleme yetkisi mevcuttur. LENACARS incelemeleri neticesinde gördüğü zarar, ziyan, kilometre kullanım limitinin %20 oranı üzerine çıkacağını fark etmesi vb. durumlar karşısında MÜŞTERİ’yi yazılı olarak uyarma, araç kullanıcısını değiştirmeyi talep etme gibi haklara sahiptir. Yazılı uyarı neticesinde iyileşme olmaması durumunda LENACARS aracın iadesini isteme hakkını saklı tutar. Bu doğrultuda uğrayacağı tüm zarar, ziyanları MÜŞTERİ’ye fatura eder. 

6.16	MÜŞTERİ, LENACARS’ı, Aracın elde tutulması ve kullanımını düzenleyen hükümlere veya yasal düzenlemelere uyulmamasından kaynaklanan bütün inceleme, soruşturma ve kovuşturmalara karşı güvence altına almakla ve LENACARS’ın söz konusu ihlalden dolayı herhangi bir zarara uğraması halinde bu zararı tazmin etmekle yükümlüdür.

6.17	MÜŞTERİ, hâkimiyetinde bulunduğu süre boyunca Araç’ların tüm yakıt, otopark, köprü ve otoyol geçiş ücretleri, gerek sürücü hatalarından gerekse Araç’a ilişkin olası eksikliklerden kaynaklanacak trafik para cezalarından ve yargı masraflarından sorumlu olup bunları direkt olarak yetkili mercilere ödemekle yükümlüdür. Böyle bir durumun söz konusu olması halinde, MÜŞTERİ bu durumu ve ilgili ödemeyi derhal ve yazılı olarak LENACARS’a bildirecektir. Taraflar, trafik cezasının sürücü ismi belirtilmeksizin sadece Aracın plakası belirtilmek suretiyle düzenlenmiş olmasının MÜŞTERİ’nin sorumluluğunu herhangi bir şekilde etkilemeyeceği hususunda mutabık kalmıştır. İşbu maddede belirtilen nitelikte veya benzeri cezaların LENACARS’a tebliğ edilmesi ve/veya LENACARS tarafından tespit edilmesi halinde, LENACARS söz konusu ceza tutarlarını ilgili makamlara ödeyerek ceza makbuzlarını, MÜŞTERİ’ye hitaben düzenleyeceği fatura ekinde gönderecektir. MÜŞTERİ, LENACARS’ın söz konusu cezalara ilişkin olarak herhangi bir itirazda bulunma yükümlülüğünün olmadığını kabul etmiş olup LENACARS tarafından yapılmış olan ödemeye ilişkin itiraz haklarından peşinen feragat etmiştir. Söz konusu faturalar MÜŞTERİ tarafından 4.2 madde hükmü uyarınca LENACARS’a ödenecektir.

Ayrıca MÜŞTERİ, Araç her ne sebeple LENACARS’a iade ve/veya teslim edilmiş olursa olsun, kendi hâkimiyetinde bulunduğu süre boyunca Araç’a ilişkin olarak tahakkuk edecek otopark, köprü ve otoyol geçiş ücretleri gerek sürücü hatalarından gerekse Araç’a ilişkin olası eksikliklerden kaynaklanacak trafik para cezalarından doğan her türlü cezai ve idari sorumluluğun, bir süre ile sınırlı olmaksızın kendisine ait olduğunu kabul, beyan ve taahhüt etmiştir.

6.18	MÜŞTERİ, Sipariş Onay Formu’nu imzalayıp LENACARS’a teslim ettiği tarihte Aracı seçtiğini ve LENACARS’tan söz konusu aracı imalatçısından veya tedarikçisinden satın almasını talep ettiğini kabul etmiştir. MÜŞTERİ, herhangi bir Aracın herhangi bir amaç için kalitesiyle veya uygunluğuyla veya Aracın tatmin edici kaliteye sahip olduğuna ilişkin olarak LENACARS tarafından hiçbir koşul, beyanat veya garanti verilmediğini ve LENACARS’ın herhangi bir aracın kiralanmasıyla ilgili olarak MÜŞTERİ’nin veya herhangi bir kişinin maruz kaldığı zarar veya ziyan ile Sözleşme ve Sipariş Onay Formu altında düzenlenenler dışında başka bir şekilde hiçbir yükümlülük altında olmayacağını beyan ve kabul etmiştir.

6.19	LENACARS, sürücü güvenliğini önemsemesi dolayısıyla, kiraladığı araçlarda, ATKS veya araç takip sistemi bulundurabilir. LENACARS bu sistem sayesinde, acil durumlarda; kaza, hasar, trafikte sürüş güvenliğini tehdit edecek olaylar, lastik patlaması, yakıt bitmesi gibi yol yardım gerektirecek hallerde 7/24 çağrı merkezi hizmeti sunmaktadır sunmaktadır. Bu hizmet aracın içerisine yerleştirilen cihaz üzerinde yer alan kırmızı ve yeşil tuşlar sayesinde sağlanmaktadır. Aynı zamanda acil durumlar için kullanıcıların sağlık bilgileri bu sistemde kayıt altında tutularak, olası sağlık müdahalesi gerektiren durumlarda oldukça faydalıdır. ATKS kaza algılama sistemi aynı zamanda kullanıcı bazlı kaza risk skorlaması yapmaktadır. Olası kazaları önleme konusunda kullanıcı sağlığı ve oluşabilecek maddi zararlara karşı kalkan olmaktadır. Şirket bordrosunda yer alan ve araç kullanıcısı olarak tanımlanan çalışanlara LENACARS tarafından gerekli kullanım eğitimi verilecektir. Araç kullanıcısı çalışanların bu sisteme tanımlanması ve KVKK kapsamında doğan yükümlülüklerin yerine getirilmesinden MÜŞTERİ sorumlu olacaktır. İşbu sözleşme kapsamında MÜŞTERİ ATKS kaza algılama sistemine dâhil olduğunu kabul, beyan ve taahhüt etmektedir. ATKS kaza algılama sistemi aynı zamanda araç kullanıcılarının sürüş ve kullanım performanslarını analiz etmektedir. Bu analiz doğrultusunda kullanıcıya özgü risk skoru ortaya çıkar, Kullanıcı sürüş performansına dayalı kaza risk skorunun yüksek çıkması durumunda ise LENACARS MÜŞTERİ’ye yazılı şekilde uyarıda bulunur. LENACARS tarafından yapılan yazılı uyarıya rağmen sürüş performansının yükselmemesi ve kaza riskinin yüksek seyretmesi durumunda LENACARS sözleşmeyi fesih ederek, aracı iade talebinde bulunma hakkına sahiptir. Böyle bir durumun oluşması halinde ortaya çıkacak zarar, ziyan LENACARS tarafından MÜŞTERİ’ye fatura edilecektir.

6.20	ATKS veya araç takip cihazı cihazı, MÜŞTERİ tarafından kesinlikle araçtan sökülemez ve çıkarılamaz. Bu durumda oluşabilecek her türlü zarardan MÜŞTERİ sorumludur. ATKS cihazı, ATKS’nin onayı ile sadece ATKS’nin yetkilendirdiği servislerce sökülebilir. ATKS cihazında takılı olan sim kartın çıkarılması, başka herhangi bir cihazda kullanımı yasaktır. Bundan dolayı oluşabilecek her türlü zarardan ve olaydan MÜŞTERİ sorumlu olup, MÜŞTERİ; gerek kendisi gerek çalışanları gerekse iş ortaklarının ATKS cihazına ve içinde takılı halde bulunan SIM kartın çıkarılması, hasarlanması, amacı dışında kullanılması/kullandırılması gibi kasıtlı eylemleri sebebiyle oluşan zararlardan sorumlu olduğunu, ATKS’nin hukuki ve cezai sorumluluğunun bulunmadığını ve sorumluluğun kendisine ait olduğunu, Atike’nin bu nedenle uğramış olduğu zararlardan bizzat sorumlu olduğunu peşinen kabul, beyan ve taahhüt etmiştir.

6.21	MÜŞTERİ, ATKS Sistemi cihazının kötü veya amaca aykırı kullanımı, LENACARS’ın yazılı onayı olmadan teknik veya fiziksel müdahale yapılması, onarımı ve benzer durumlar karşısında sağlanacak servis hizmeti için cihaz başına 2500TL +KDV servis ücreti ödeyeceğini, verilen servis hizmeti sonrasında ATKS Sistemi’nde MÜŞTERİ’den kaynaklı olduğu ve cihazda telafisi mümkün olmayan ve geri dönülmez zararlara yol açtığı tespit edilmesi halinde 200 € (İki Yüz Euro)+KDV cihaz bedelini ödeyeceğini kabul, beyan ve taahhüt eder. LENACARS’IN maddi ve manevi tüm zararlarını ayrıca talep etme hakkı saklıdır.

6.22	MÜŞTERİ, işbu maddenin hükümlerinde yer alan her türlü yükümlülüğünün bu Sözleşme kapsamında kendisine teslim edilecek Öncül Araç ve yedek Araç’lar bakımından da aynen geçerli olduğunu gayrikabili rücu kabul ve taahhüt etmiştir.

7)	 Bakım ve Hizmetler

Bakım ve hizmetlere ilişkin olarak LENACARS’ın ve MÜŞTERİ’nin mükellefiyetleri işbu Sözleşme’nin eki ve ayrılmaz bir parçası olan EK-2 BAKIM VE ONARIM HİZMET SÖZLEŞMESİ’nde yer almaktadır.

8)	Sigortaya İlişkin Hükümler

Sigorta hizmetlerine ilişkin olarak LENACARS’ın ve MÜŞTERİ’nin mükellefiyetleri işbu Sözleşme’nin eki ve ayrılmaz bir parçası olan EK-1’de bulunan SİGORTA HİZMET SÖZLEŞMESİ’nde yer almaktadır.

9)	 Sipariş Onay Formu’nda Değişiklik Yapılması

LENACARS’ın dönemsel olarak hazırlanan raporlar/veriler sonucunda Fiili Kilometre’nin Sözleşme Kilometresi’ni %20 ve daha fazla aşması ihtimali olduğu sonucuna varması durumunda, LENACARS ilgili Araç için Sipariş Onay Formu’nda değişiklik yapılması hakkını saklı tutar.
Ayrıca ATKS kaza algılama sistemi sayesinde kullanıcıya özgü yapılan risk skorlaması sonucunda, sürüş performansının sürekli olarak düşük seyretmesi (100 üzerinden min. 50 puan) durumunda LENACARS sipariş formu ve araç kiralama sözleşmesi üzerinde değişiklik yapma, gerekli gördüğü durumda sözleşmeyi derhal fesih etme hakkına sahiptir. 

LENACARS’ın talebiyle Sipariş Onay Formu üzerinde yapılacak Kira Süresi ve Sözleşme Kilometresi ile ilgili bütün değişikliklere istinaden Kira Süresi sonuna kadar geçerli olacak Kira Ücreti yeniden hesaplanacak ve Kira Süresi sonuna kadar revize edilen Kira Ücretler’i MÜŞTERİ mutabakatına istinaden geçerli olacaktır.

10)	Erken Fesih

10.1	Müşteri sözleşme süresi sona ermeden araç iade ettiği veya sözleşmedeki yükümlülüklerine uymayarak sözleşmenin feshine neden olduğu takdirde, sözleşme süresinin bitimine kadar ödemesi gereken kira bedelinin tamamını cezai şart olarak LENACARS’a ödemekle yükümlüdür. 

10.2	MÜŞTERİ’nin Sözleşmeyi Erken Feshi durumunda, LENACARS Araç’ların iade edildiği tarihe göre kilometre limitini hesaplayacaktır. Araç’ların LENACARS’a iadesi sırasında tespit edilen kilometrenin, iade edildiği tarihe göre hesaplanan kilometre limitinin üzerinde olması halinde, MÜŞTERİ madde 10.1’de belirtilen erken iade ücreti ile birlikte fazla kullanılan her kilometre için Sipariş Onay Formu’nda belirtilen Kilometre Aşım Ücretini de LENACARS’a ödemekle yükümlü olacaktır. Hesaplama örneği aşağıda belirtilmiştir:

MÜŞTERİ ile anlaşılan yıllık kilometre x kilometre olan bir Aracın 8. ayda y kilometrede iade edilmesi durumunda; (x kilometre / 12 Ay * 8 Ay = z kilometre. y kilometre – z kilometre = Hesaplama sonucunda çıkan kilometre * Kilometre Aşım Ücreti = Hesaplanacak Tutar) fazla kullanım bedeli MÜŞTERİ tarafından ödenecektir.


11)	 Sözleşme’nin Feshi

11.1	MÜŞTERİ, her bir Sipariş Onay Formu’nda belirtilen Kira Süresi’nin sonunda, Sipariş Onay Formu’nun herhangi bir ihtar ve ihbara gerek olmaksızın kendiliğinden sona ereceğini kabul ve taahhüt etmiştir.

11.2	Taraflardan herhangi birisi, işbu Sözleşme ve/veya Sipariş Onay Formu ile yüklendikleri mükellefiyetlerden herhangi birini veya tamamını kısmen veya tamamen hiç veya gereği gibi yerine getirmeyen diğer Tarafa, işbu Sözleşme’nin ve/veya Sipariş Onay Formu’nun ihlaline yol açan durumun ortadan kaldırılması için yazılı bildirimde bulunarak (10) günlük bir süre verecektir. Kendisine yazılı bildirimde bulunulan Taraf, verilen süre içerisinde Sözleşme’ye ve/veya Sipariş Onay Formu’na aykırı tutumunu tamamen ortadan kaldırmaz ise, bildirimde bulunan Taraf, işbu Sözleşme’yi ve/veya Sipariş Onay Formu’nu tek taraflı olarak feshetmek hak ve yetkisine sahip olacaktır. Taraflar’ın Sözleşme içerisinde belirlenmiş olan sair sebeplerle fesih hakları saklıdır. 

11.3	Taraflardan herhangi biri ticari faaliyetini tatil eder / durdurursa veya durdurma tehdidi bulunursa, malvarlığında önemli bir değişiklik meydana gelirse, iflas ederse, aciz haline düşerse, iflasın ertelenmesi talebi ile mahkemeye başvurursa, ticari faaliyetlerini tasfiye ederse ya da bu hallerden birinin gerçekleşme tehdidi bulunursa, işletmesinin tümü veya bir kısmı için tasfiye memuru veya kayyum atanırsa veya atanma tehdidi bulunursa, diğer Taraf Sözleşme’yi süre vermeksizin ve herhangi bir tazminat yükümlülüğü olmaksızın tek taraflı olarak feshetme hakkına sahip olacaktır.

11.4	Sözleşme’nin süresinin bitmesi veya LENACARS tarafından işbu madde hükmünce usulüne uygun olarak herhangi bir sebeple fesih edilmesi halinde, MÜŞTERİ, iflas veya iflas ertelemesi kararı almış olsa dahi, kendisinde bulunan Araç’ları feshi müteakip (3) gün içerisinde LENACARS’a, işbu Sözleşme’nin 12. ve 13. maddelerinde belirlenen şekilde teslim etmeyi kabul ve taahhüt etmiştir. Aksi halde emniyeti suistimal suçu oluşacaktır. Ayrıca MÜŞTERİ, Aracın teslim edilmesi gereken tarihteki rayiç bedelini Sözleşme’nin 4. maddesi düzenlemelerine uygun olarak LENACARS’a ödeyeceğini kabul, beyan ve taahhüt etmiştir. Sözleşme’nin, LENACARS tarafından 11. maddenin 11.2 ve 11.3 bentleri hükmünce herhangi bir sebeple usulüne uygun olarak fesih edilmesi halinde, MÜŞTERİ, LENACARS’ın Aracın servis ve bakım hizmetlerini durdurma, bu hizmetleri vermeme hakkı bulunduğunu, servis ve bakım hizmetlerinin bu sebeple durdurulması halinde durdurulan süre içinde Araç’ta gerçekleşecek herhangi bir arıza/hasar/zarardan dolayı tüm sorumluluğun kendisine ait olduğunu, ek olarak bu hallerde LENACARS’ın Araç’a serviste yahut bulunduğu yerde el koyma hakkı olduğunu, bu hususta herhangi bir itiraz hakkı bulunmadığını gayrikabili rücu kabul ve taahhüt etmiştir. MÜŞTERİ, LENACARS’ın her ne sebep ile olur ise olsun geri aldığı Araç’lar üzerinde malik sıfatı ile dilediği her tür tasarrufta bulanabileceğini kabul etmiştir. LENACARS tarafından sözleşmenin tek taraflı feshi halinde MÜŞTERİ kullandığı araçları derhal LENACARS’a iade edecektir Araçların LENACARS’ a iade edilmemesi halinde LENACARS, araçların trafikten men edilmesini talep edebilir, aracı çekici, çilingir, anahtar vb. kullanarak dilediği şekilde bulunduğu yerden alabilir.

11.5	LENACARS araçlarında kullanılmakta olan ATKS sistemine tanımlaması yapılan kullanıcı/kullanıcıların güvenli sürüş skorunun sürekli olarak belirlenen limitlerin altında (100 üzerinden min. 50) seyretmesi halinde LENACARS, MÜŞTERİ’yi ve araç kullanıcısını kaza riskinin yüksek seyrettiğine dair yazılı şekilde uyarır. Yapılan yazılı uyarıya rağmen kullanıcı/kullanıcıların kaza risk skorunun yükselmemesi halinde LENACARS araç kira sözleşmesini tek taraflı derhal fesih etme hakkına sahiptir. 

11.6	LENACARS, son 12 (oniki) ayda 2 (iki) defa kusuru %50’nin üzerinde kaza yaptığını veya tutanak tutulmamış iki kaza tespit ettiği bir araç kullanıcısının, aracı kullanmaktan men edilmesini MÜŞTERİ’den talep edebilir veya sözleşmeyi tek taraflı derhal fesih etme hakkına sahiptir. Böyle bir halde LENACARS uğramış olduğu tüm maddi ve manevi zararlar MÜŞTERİ tarafından ödenecektir.  

11.7	Sözleşme’nin LENACARS tarafından işbu maddenin 11.2 ve 11.3 bentleri hükmünce usulüne uygun olarak fesih edilmesi halinde, MÜŞTERİ, Kira Süresi sonuna kadar ödenmesi gereken Kira Ücretleri’nin tamamının muaccel hale geleceğini kabul, beyan ve taahhüt etmiştir. Bu halde, MÜŞTERİ, işbu Sözleşmenin 14.maddesine göre hesaplanacak bütün kilometre aşım ücretleri (“Kilometre Aşım Ücretleri”) de dâhil olmak üzere varsa fesih tarihine kadar ödenmemiş olan birikmiş Kira Ücreti ile Kira Süresi’nin sonuna kadar olan Kira Ücretleri’nin tamamını, LENACARS’ın bunu aşan zararlarını LENACARS’ın talebini takip eden (5) gün içerisinde nakden/hesaben ve defaten ödemekle yükümlüdür.

11.8	Sözleşme’nin 4.4. maddesinde yer aldığı üzere; MÜŞTERİ, LENACARS’a olan ödemelerini iki defa geciktirmesi durumunda (Sözleşmede yazılı olan ödeme gününde ödeme yapılmadığı takdirde müşteri ödemede gecikmiş temerrüde düşmüş olarak kabul edilir) LENACARS MÜŞTERİ ile olan sözleşmesini bu haklı nedene dayanarak herhangi bir ihtar ve uyarıya gerek kalmaksızın tek taraflı olarak fesih edebilir. Böyle bir halde, LENACARS işbu sözleşmenin ilgili hükümleri gereği uğradığı tüm zarar, ziyanı MÜŞTERİ’den tahsil edecektir. MÜŞTERİ bu durumu peşinen kabul etmiş sayılacak olup MÜŞTERİ’nin itiraz hakkı bulunmamaktadır. 

12)	 Araçların İadesi

12.1	Araç, Kira Süresi’nin sona ermesi veya işbu Sözleşme’nin ve/veya Sipariş Onay Formu’nun herhangi bir nedenle fesih edilmesi halinde, (3) gün içerisinde, yaşına ve Sözleşme Kilometresi’ne uygun bir koşulda, Aracın sözleşme şartlarına uygun kullanımdan kaynaklanan normal aşınma ve yıpranma haricinde kiralandığı şekilde LENACARS’a MÜŞTERİ tarafından teslim edilecektir. Teslim borcunun ifa edilmiş sayılması için Araç’ların, teslimden en az (2) gün önce MÜŞTERİ tarafından LENACARS’a yazılı bildirim yapılması koşuluyla LENACARS tarafından belirlenecek ve MÜŞTERİ’ye bildirilecek olan adreste, geçerli bir teslim tesellüm belgesi imzalanması kaydıyla teslim edilmiş olması şarttır. Araç’ların iadesinin tatil gününe denk gelmesi halinde MÜŞTERİ, söz konusu iadeyi tatil gününden bir önceki iş gününde gerçekleştirmeyi kabul ve taahhüt etmiştir. MÜŞTERİ tarafından LENACARS’a bu şekilde bir yazılı bildirimin usulüne uygun olarak yapılmamış olması veya yazılı bildirimin geç yapılması halinde MÜŞTERİ, Araç’ların İstanbul’a ve LENACARS’ın belirlediği adrese nakil masrafları ile birlikte Araçların iadesine dair yazılı bildirimin geç yapıldığı süre içerisindeki kullanıma dair orantısal olarak hesaplanacak olan Kira Ücreti de dâhil ancak bunlarla sınırlı olmamak kaydıyla sair tüm masrafları LENACARS’a ödemekle yükümlüdür. LENACARS’ın madde 14.2’de belirtilen bedele ilişkin talep hakları saklıdır.
12.2	İade sırasında, tedarikçi ve/veya LENACARS’ın temsilcisi Araç Teslim Belgesi imzalayarak Aracın iade edildiği tarihteki Araç üzerinde belirtilen kilometresini ve görünür hasarını (hasarın onarım miktarı hariç olmak üzere) bir tutanak marifetiyle belirleyeceklerdir. LENACARS, Aracın daha ayrıntılı değerlendirilmesi ve hasar miktarının belirlenmesi için (7) iş günü süreye sahip olacaktır. LENACARS hasarın miktarını, işbu hasarı gidermek için gerekli Yıpranma Masrafları’nı, henüz ilgili onarım gerçekleştirilmeden evvel LENACARS personeli veya LENACARS tarafından atanmış ekspertiz bürolarına tespit ettirecektir. Araç Teslim Belgesi’nde ve ekspertiz raporunda yer alan hususlar geçerli, bağlayıcı ve kesin delil teşkil edecektir. Araç Teslim Belgesine ve esas ekspertiz raporuna göre belirlenmiş olan hasar ve rücu tutarları MÜŞTERİ’ye LENACARS müşteri temsilcisi tarafından e-mail ile bildirilir. Aracın üzerinde bulunan mevcut hasarların detaylı fotoğrafları ve Araç’ta bulunan eksikler (anahtar, yedek anahtar, zincir, avadanlık, bakım kılavuzu, ruhsat, teknik tarifnameler, aksesuar, cihaz, ilk yardım seti, yangın tüpü, kriko vb.) parça ve işçilik fiyatları da bu bildirimde MÜŞTERİ ile paylaşılacaktır. Bu bildirimden sonra Taraflar arasında mutabakat sağlanır. Taraflar arasında mutabakat sağlandıktan sonra, LENACARS, Yıpranma Masrafları’na ilişkin olarak MÜŞTERİ’ye fatura düzenleyecektir. MÜŞTERİ, bu bedeli faturayı tebliğ aldığı tarihten itibaren (5) gün içerisinde LENACARS’a nakden/hesaben ve defaten ödemeyi kabul ve taahhüt etmiştir. Taraflar arasında bildirimden itibaren (25) gün içerisinde mutabakat sağlanamadığı durumda LENACARS’ın mezkur ekspertiz raporuna dayanarak tespit edilmiş hasar miktarı için talep ve dava hakları saklıdır.
12.3	Araç kira süresi uzatma talepleri min. 1 ay öncesinde LENACARS’a sözlü ve yazılı şekilde iletilmelidir. Süre uzatımı LENACARS’ın belirleyeceği güncel kira tutarı doğrultusunda gerçekleşecektir. LENACARS süre uzatımı konusunda tek başına karar verme yetkisine sahiptir, dilediği takdirde aracın kira sürecini sonlandıracaktır. MÜŞTERİ’nin bu duruma itiraz etme hakkı bulunmamaktadır.
12.4	Sipariş formunda yer alan araç kiralama süresinin sonunda, araç iadesinin belirtilen gün ve saatte yapılmaması halinde 1 – 3 saat arası gecikmelerde güncel kira tutarı üzerinden yarım gün, 3 saati aşan gecikmelerde tam gün kira bedeli MÜŞTERİ tarafından ödenecektir. Araç iade süresinin 1 günü geçmesi halinde LENACARS güncel kira tutarının 3 katı oranında ceza bedelini MÜŞTERİ’ye yansıtacaktır. Ayrıca aracın zamanında teslim edilmemesi dolayısıyla LENACARS araç rezervasyon sürecinde yaşanan aksamalar doğrultusunda oluşacak tüm zarar, ziyan MÜŞTERİ’ye fatura edilecektir.

13)	 Kilometre Aşım Ücreti

MÜŞTERİ’nin kullanımına tahsis edilecek olan her bir Aracın Kira Süresi ve Fiili Kilometre Kullanımı limiti Sipariş Onay Formu ile belirlenecektir. Öncül Araç tedarik edildiği hallerde Öncül Aracın kullanım süresi bu Kira Süresi’nin hesabına dâhil edilmeyecektir.

13.1	Kira Süresi’nin hitamı ile sona eren her Sipariş Onay Formu için, LENACARS, Fiili Kilometrelerle Sözleşme Kilometrelerini karşılaştırarak, her Araç için Kilometre Aşımı’nı koşullara uygun olarak belirleyecektir.

LENACARS ayrıca, Fiili Kilometreler’in, Sözleşme Kilometreleri’ni aştığı durumlarda, aşağıdaki formülü kullanarak Aşan Kilometre Ücreti’ni hesapladıktan sonra, bütün Araçlarla ilgili bir fatura düzenleyecektir:

(Fiili Kilometreler – Sözleşme Kilometreleri) x Aşan Kilometre Ücreti

Fiili Kilometre tespitinde Aracın geri teslim alınması sırasında düzenlenen iade araç formu esas alınır.

13.2	Herhangi bir Aracın 160.000 Fiili Kilometre sınırını aşması durumunda, söz konusu Araç MÜŞTERİ tarafından derhal LENACARS’a iade edilecektir. Bu durumda MÜŞTERİ’nin imzalamış olduğu Sipariş Onay Formu’nda aylık servis ödemesi olarak belirtilen bedelin tahsil edilememiş olan ayların karşılığı kadar kısmı, 13.1 maddesi ile belirlenen formüller üzerinden hesaplanan Kilometre Aşım Ücreti ve 11.2 maddesi ile belirlenmiş olan erken iade ücreti MÜŞTERİ’ye fatura edilecek olup bu bedel (5) gün içerisinde LENACARS’a ödenecektir.
13.3	MÜŞTERİ kilometre saatinin doğru olarak çalışır biçimde korunmasından sorumludur. MÜŞTERİ, kilometre saatinin doğru olarak çalışmadığını tespit etmesi halinde bunu (3) gün içerisinde LENACARS’a yazılı olarak bildirmekle yükümlüdür. Bu durumun bildirilmemesi halinde, üretici firma yetkili servisleri tarafından tespit edilen kilometre bilgisi, bu bilginin bulunmaması halinde ise kilometrenin tespit edildiği son tarihten itibaren günlük 250 km. olarak yapılacaktır. Kilometre bilgisini belirten son dokümanın bulunmaması halinde belirtilen hesaplama Kira Süresi’nin başlangıç tarihinden itibaren yapılacaktır. Bu durumda MÜŞTERİ, LENACARS ve üçüncü şahıslara karşı ortaya çıkabilecek tüm hukuki ve cezai sonuçlardan sorumlu olacaktır.

14)	Tazminat

Kiralanan Araç’ların herhangi bir kazaya karışması, zarara uğraması veya çalınması durumunda meydana gelen zararın trafik sigortası ve/veya kasko sigortasından alınabilmesini teminen kanunen yapılması gereken işlemlerin eksiksiz yapılması sorumluluğu MÜŞTERİ’ye ait olacaktır. Ayrıca kısmen veya tamamen sigorta şirketi tarafından karşılanmayan, sigorta teminatı dışında kalan, sigorta teminatını aşan her türlü hasar, zarar ve 3. şahıslar tarafından yöneltilecek tazminat taleplerinin tümü MÜŞTERİ tarafından karşılanacaktır. İşbu hallerin varlığının kabulünde sigorta şirketinin hasarın reddedildiğine ilişkin yazısının yeterli olacağı konusunda Taraflar mutabık kalmışlardır.

14.1	MÜŞTERİ Aracın işletilmesi sırasında meydana gelen, sigorta teminatı dışında kalan ve/veya sigorta teminatını aşan her türlü halde;
●	Gerek Araç’a gerekse üçüncü kişilere verilen maddi, manevi, cismani her türlü zararlardan,
●	Üçüncü kişilerin LENACARS aleyhine yönelteceği maddi ve manevi tazminat taleplerinden,
●	Adli makamlara verilmesi gereken teminat mektuplarından, nakit blokajlardan, tehir-i icra ve ihtiyati tedbirin kaldırılması giderlerinden, tüm bu talep, takip ve davaların yargılama harç ve giderlerinden, faiz ve ferilerinden, otopark/yediemin ücretlerinden ve avukatlık ücretlerinden, bizzat sorumlu olacağını ve ödemek zorunda kalacağı bu tür hasar, zarar, ziyan, tazminat v.s. sair tutarları, hiçbir şekilde LENACARS’a rücu etmeyeceğini kabul, beyan ve taahhüt eder.

Sözleşme sona ermiş olsa ve/veya Araç LENACARS’a her ne sebeple olursa olsun iade edilmiş olsa dahi, MÜŞTERİ’nin işbu sorumluluğu Aracın fiili hâkimiyetinin MÜŞTERİ’de bulunduğu süre içerisinde meydana gelen vakıalar nedeniyle aynen devam edecektir.

14.2	MÜŞTERİ, işbu Sözleşme konusu ekipman ve Araç’ları, Kira Süresinin bitimini veya Sözleşmenin feshini müteakip (3) gün içerisinde LENACARS’a iade edeceğini, aksi takdirde, LENACARS’ın gecikme ile ilgili olarak yazılı onayının alınmaması halinde, her geçen gün için Sipariş Onay Formu’nda kararlaştırılacak olan kullanım bedelini ödemeyi gayrikabili rücu kabul, beyan ve taahhüt etmiştir.

14.3	MÜŞTERİ, Araçların üretici firmanın garantilerini geçersiz kılacak herhangi bir şekilde kullanılması, periyodik bakımlarının belirlenen süre ve kilometre sınırlarına uygun olarak yaptırılmaması durumunda, LENACARS’ın maruz kalacağı her türlü zararını tazmin edecektir. Kiralanan Araç’lar ile ilgili garanti koşulları, üretici ve satıcı firmanın LENACARS’a vermiş bulunduğu garantilerle sınırlı olup, bu garantilerin haricinde MÜŞTERİ, LENACARS’dan başkaca herhangi bir garanti talebinde bulunamaz. 

14.4	İş bu sözleşme konusu aracın/araçların karıştığı kazalar nedeniyle, araçta doğacak değer kaybını MÜŞTERİ, LENACARS’a ödeyecektir. Ayrıca MÜŞTERİ nin %50’nin üzerinde kusurlu olduğu durumlarda aracın pert olması halinde, aracın güncel ve hasarsız rayiç değeri ile pert hali arasındaki % 20 değer kaybı MÜŞTERİ ye yansıtılacaktır. LENACARS, 3. Şahıslara veya sigorta şirketlerine herhangi bir tazminat ödemek zorunda kalırsa, MÜŞTERİ bu tazminatı ve yargılama giderleri, avukatlık ücreti gibi her türlü ek masrafları LENACARS’a ilk taleple birlikte derhal ödemeyi kabul ve taahhüt eder. Bu gibi durumlarda LENACARS aleyhine açılan tüm davalar MÜŞTERİ’ye ihbar edilir. MÜŞTERİ’nin LENACARS yanında davaya katılması ve savunma yapması gerektiğini MÜŞTERİ peşinen kabul eder. 


15)	Genel Hükümler

15.1	Taraflardan birinin diğer Tarafa tebliğ etmesi gereken herhangi bir ihbar yazılı olacak ve Tarafların yukarıda belirtilen ilgili adreslerine iadeli taahhütlü posta veya noter aracılığı ile yapılacaktır. Taraflar adres değişikliğini diğer Tarafa (5) gün içerisinde yazılı olarak bildirmelidir. Aksi takdirde, herhangi bir Tarafça bilinen adrese yapılan tebligat geçerli olacaktır.

15.2	Taraflardan herhangi birisinin bu Sözleşme’de ya da herhangi bir Sipariş Onay Formu’nda yer alan koşullardan ve şartlardan herhangi birinin yerine getirilmemesi halinde söz konusu koşuldan, şarttan, haktan veya imtiyazdan feragat ettiği veya diğer Tarafı ibra ettiği şeklinde yorumlanmayacak ve ihlale maruz kalan Tarafın tamamen geçerliliğini koruyacak olan haklarını etkilemeyecek veya bunlara halel getirmeyecek ve herhangi bir haktan feragat edilmesi daha sonra veya devamlı olarak feragat edileceği anlamına gelmeyecektir.

15.3	Her iki tarafın onayı ile ve usulüne uygun şekilde yazılı olarak gerçekleştirilmedikçe işbu Sözleşme veya Sipariş Onay Formu değiştirilemeyecektir. İşbu Sözleşme, Sipariş Onay Formu ve bu Sözleşme’nin Ekleri Taraflar arasındaki bütün Sözleşmeyi oluşturmakta olup bu konuda akdedilen önceki yazılı veya şifahi bütün Sözleşmelerin, taahhütlerin ve mutabakatların yerine hüküm ifade etmektedir.

15.4	İki Taraf arasında yapılan Sözleşme marifetiyle, Taraflar, birbirlerinin faaliyetlerine ilişkin olarak belli bilgiler edinecektir. Taraflar bu bilgileri bu Sözleşme ve Sipariş Onay Formu hükümlerinin yerine getirilmesi için kullanacaktır. Daha önce kamuya mal olmuş bilgiler ile kanunen yetkili mercilerin talep etmesi durumu hariç olmak üzere, Taraflar söz konusu bilgileri bağlı şirketleri, temsilcileri ve aşağıda 15.5. maddede belirtilen kurum ve kuruluşlar dışında işbu Sözleşme sona erse ya da iptal edilse dahi önceden yazılı onay almaksızın üçüncü kişilere açıklamayacaktır.

15.5	Sipariş Onay Formu’nda belirtilen bilgiler ve Araç Siparişi ile ilgili ek bilgiler kredi kararlarının verilmesine yardımcı olunması amacıyla LENACARS grubundaki diğer şirketlere, kredi derecelendirme kuruluşlarına, kredi kurumlarına ve LENACARS namına hareket eden herhangi bir kişiye, MÜŞTERİ’nin menfaatleri ve gizlilik prensipleri gözetilerek verilebilir. MÜŞTERİ, işbu Sözleşme ve ekleri bakımından, LENACARS’ın ilgili tüm taraf ve kişilere karşı, Sözleşme öncesi sunulan “KVKK AYDINLATMA FORMU” vasıtasıyla, başta özel hayatın gizliliği olmak üzere kişilerin temel hak ve özgürlüklerini korumak ve kişisel verilerin korunması amacıyla düzenlenen 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) hakkında aydınlatma yükümlülüğünü yerine getirdiği hususunda mutabıktırlar. İlaveten MÜŞTERİ, LENACARS ile arasındaki ticari ilişki gereğince LENACARS’a sağlayacağı herhangi bir gerçek kişiye ait her türlü kişisel bilgilerin KVKK kapsamında kişisel veri olması halinde, MÜŞTERİ’nin veri işleyen ve veri sorumlusu sıfatlarını bizzat haiz olduğunu, bu doğrultuda KVKK kapsamında ilgili gerçek kişiler nezdinde aydınlatma yükümlülüğünü eksiksiz şekilde yerine getirdiğini ve getireceğini, KVKK tarafından öngörülen çerçevede açık rızalarını aldığını ve alacağını, açık rızaları bulunmayan kişilerin kişisel verilerini LENACARS ile paylaşmadığını ve paylaşmayacağını, kişisel verilerini LENACARS ile paylaştığı kişilerden söz konusu kişisel verilere dair MÜŞTERİ’ye gelen her türlü talep ve iddia bakımından LENACARS’ı derhal bilgilendireceğini, gerekli işlemlerin yapılmasını temin edeceğini ve bunlarla sınırlı olmaksızın KVKK’dan “veri sorumlusu” ve “veri işleyen” sıfatı ile kaynaklanan veri güvenliği dâhil tüm yükümlülükleri bizzat yerine getireceğini ve LENACARS’ın bu hususlarla ilgili olarak hiçbir yükümlülük ve sorumluluğu olmadığını, LENACARS’ın her türlü talep, zarar ve sorumluluktan beri kılacağını ve LENACARS’ın herhangi bir şekilde zarara uğraması halinde, LENACARS’ı derhal ve eksiksiz şekilde tazmin edeceğini kabul, beyan ve taahhüt eder.

15.6	İşbu Sözleşme ve Sipariş Onay Formlarının imzalanmasından doğacak damga vergisi, resim, harç v.s. MÜŞTERİ tarafından ödenecektir.

15.7	MÜŞTERİ, LENACARS tarafından kendisine gönderilebilecek her türlü uyarı ihbarnameleri ile fesih ihtarnamelerine ilişkin noter harç ve masraflarını, ihmali veya kusuru nedeni ile Aracın hasar gördüğü, arızalandığı, zarar gördüğü veya kullanılamaz hale geldiği hallerde 6100 sayılı Hukuk Muhakemeleri Kanunu kapsamında yapılacak delil tespiti dâhil, kendisi aleyhine yapılacak icra takiplerine, açılacak davalara ilişkin yasal olarak LENACARS tarafından ödenmek zorunda olanlar dâhil her türlü harç, masraf ve yargı giderlerini LENACARS’a ödeyeceğini kabul etmiştir. İşbu tutarlara dair LENACARS tarafından MÜŞTERİ’ye fatura düzenlenecek ve fatura bedeli MÜŞTERİ tarafından Sözleşme’nin 4.2 maddesine uygun olarak ödenecektir.

15.8	MÜŞTERİ, herhangi bir sebeple LENACARS’dan alacaklı olduğu takdirde bu alacağını vadesi geçmiş borçlarıyla takas veya mahsup edemez.

15.9	MÜŞTERİ, işbu Sözleşme’den ve Araç Kiralama Tekliflerinden kaynaklanan yükümlülüklerinden herhangi birini ifada temerrüde düşmesi halinde, LENACARS ile daha önceden akdetmiş oldukları Uzun Dönem Araç Kiralama Sözleşmeleri için de temerrüde düşmüş sayılacaklarını ve LENACARS’ın bu durumu "sözleşmenin yürütülmesinin beklenmeyeceği hal" olarak değerlendirebileceğini ve Sözleşme’nin 12. maddesi uyarınca feshedebileceğini kabul ve taahhüt etmiştir.

15.10	MÜŞTERİ’nin sözleşme süresi içerisinde Kira Ücret’ini ve diğer tüm ödemelerini (HGS-OGS işletim ve geçiş ücretleri, Trafik Para Cezaları vb.) 2 defa ödememesi, geç ve/veya eksik ödemesi LENACARS için “sözleşmenin yürütülmesinin beklenmeyeceği hal” olarak değerlendirilecek ve MÜŞTERİ’ye yapılacak yazılı bir bilgilendirme ile Sözleşme, başkaca herhangi bir süre tanıma zorunluluğu bulunmaksızın LENACARS tarafından derhal fesih edilebilecek ve LENACARS tarafından alacaklarını tahsili amacıyla gerekli hukuki yollara başvurulacaktır. Bu çeşit fesih halinde; MÜŞTERİ, sözleşme konusu araçları derhal LENACARS’a iade edecektir, iade etmemesi durumunda ise LENACARS’ın araçları bulunduğu yerde alma hakkına sahip olduğunu MÜŞTERİ kabul etmiştir. 

15.11	Taraflar, LENACARS’ın işbu Sözleşme’den kaynaklanan doğmuş ve doğacak tüm haklarını banka ve finans kuruluşlarına temlik etme hakkı bulunduğu hususunda anlaşmıştır. Taraflar ayrıca LENACARS’ın Sözleşme konusu Araç’lar üzerinde banka veya finans kurumları lehine rehin tesis edebileceği hususunda anlaşmıştır.

16)	Uygulanacak Hukuk, Yetkili Mahkeme ve Davalar

Bu Sözleşme ile ilgili veya bu Sözleşme’den doğan her türlü ihtilafın çözümünde Türk hukuku uygulanacak olup, münhasıran İstanbul veya Adana Mahkemeleri ve İcra Müdürlükleri yetkili olacaktır.

İşbu Sözleşme 16 Madde, Araç Sipariş Formu, Araç Teslim Formu, Ek1 ve Ek2 den oluşmaktadır. Ek1, Ek2, Araç Sipariş Formu ve Araç Teslim Formu bu sözleşmenin ayrılmaz bir bütünüdür. Sözleşme (1) nüsha olarak imzalanmış olup orijinali LENACARS’da kalacaktır. 



TARİH: 


LENA MAMA YAYINCILIK TİCARET A.Ş

Ad-Soyad, Unvan		MÜŞTERİ (Tam Unvan)

Ad-Soyad, Unvan

Kaşe-İmza		Kaşe-İmza

























EK-1 SİGORTA HİZMET SÖZLEŞMESİ

İşbu “Sigorta Hizmet Sözleşmesi Ek-1” Uzun Dönem Araç Kiralama Sözleşmesi’nin eki ve ayrılmaz bir parçasıdır. Aksi işbu Ek-1’de belirtilmedikçe Uzun Dönem Araç Kiralama Sözleşmesi’nde kullanılan tanımlar bu metinde de geçerlidir.

LENACARS, Uzun Dönem Araç Kiralama Sözleşmesi ve Sipariş Onay Formu kapsamındaki bütün Araçlar için sadece Türkiye Cumhuriyeti sınırları içinde geçerli olan gerekli sigorta poliçelerini yaptıracaktır.

A)	LENACARS, araçların zorunlu trafik, kasko, ihtiyari mali mesuliyet ve ferdi kaza sigortalarının yapılması işini aşağıdaki şartlar ve yürürlükte olan mevzuat çerçevesinde yerine getirecektir. Sigortalı Araçlarda hasar oluşması halinde, LENACARS’ın sorumluluğu, meydana gelen zararın ilgili sigorta poliçesine dayanılarak sigortacıdan elde edilen ve ödenen kısmı ile sınırlıdır. 

B)	Aşağıda yer alan sigorta poliçeleri, poliçe genel şartlarında yer alan ana teminatlar dâhilinde tanzim edilecek, poliçe örnekleri MÜŞTERİ’ye teslim edilecek ve teslim edilen poliçelerde yer alan şartlar ile teminatlar geçerli ve bağlayıcı olacaktır.

Trafik Poliçesi: Karayolları Motorlu Araçlar Zorunlu Mali Sorumluluk Sigortası teminat limitleri ve şartları, ilgili mevzuatın resmi gazetede yayınlanan şartları ile aynı olup taraflar açısından bu hali ile tam olarak bağlayıcıdır.

Kasko Poliçesi: Kasko poliçesinde yer alan teminatlar ve KARA TAŞITLARI KASKO SİGORTASI GENEL ŞARTLARI dâhilinde tanzim edilmiştir. Teminat kapsamında bulunan ve teminat kapsamı dışında tutulan haller KARA TAŞITLARI KASKO SİGORTASI GENEL ŞARTLARI çerçevesinde belirlenecek ve taraflar açısından bağlayıcı olacaktır.
İhtiyari Mali Mesuliyet Poliçesi: Motorlu Kara Taşıt Araçları İhtiyari Mali Sorumluluk Sigortası’dır.
Ferdi Kaza Poliçesi: MÜŞTERİ tarafından yetkilendirilmiş, Araçta bulunan, araç kullanıcısının vefat, daimi maluliyet, tedavi masrafları ile ölüm ve sürekli sakatlık halinde ödenecek tazminatları ve tedavi masraflarını kapsar.
C)	MÜŞTERİ; Sipariş Onay Formu’nda belirtilen poliçeler kapsamındaki risklerden herhangi birinin gerçekleşmesi sonucu en kısa zamanda ve en geç (3) günlük süre içerisinde konu hakkında LENACARS’ın 0850 532 7929 numaralı Acil Yardım hattına başvuracak, kendisine bildirilen anlaşmalı hasar onarım adresine Aracı bırakacak ve aşağıda belirtilen önlem ve işlemleri yerine getirecektir.
Kaza, çalıntı veya gasp evrakının temin ve teslim edilememesinden veya bu nedenle zararın sigortacı tarafından ödenmemesinden ötürü doğacak maddi ve manevi sorumluluklar ile her türlü zarar ve ziyanı karşılamayı MÜŞTERİ kabul ve taahhüt etmiştir. 
Buna ek olarak MÜŞTERİ;
i)	2918 sayılı Karayolları Trafik Kanunu 28.12.2007 Sayı:2007/27 Genelge gereği tutulması gereken tutanak ile bu Genelge dışında kalan durumlarda gerekli olan ve ilgili emniyet birimlerince tutulması gereken tutanak ve evrakın, kazaya karışan sürücülere, araçlara ilişkin belgelerin, sigorta bilgilerinin, alkol raporlarının temini ve LENACARS ve/veya tamir servislerine teslim edilmesini sağlamak.
ii)	Taşıt ve/veya taşıtların fotoğraflarını çektirmek,
iii)	Olaya karışan diğer taşıtların sürücülerinin adlarını, adreslerini, sürücü belge fotokopisini, ihtiyari trafik ve kasko sigortalarını sağlayan şirketin adını ve poliçe numaralarını temin etmek,
iv)	Yukarıda belirtilen kaza ile ilgili evrak asıllarını veya çalınma halinde durumu tevsik eden zabıt, bildirim, yedek anahtar dâhil her iki anahtar ve sair evrak asıllarını olayın meydana geldiği tarihten itibaren en geç (2) gün içerisinde LENACARS’a ya da LENACARS’ın uygun gördüğü bir kişi ya da yere teslim etmekle yükümlüdür. Orijinal fabrikasyon anahtarlarının (Yedek anahtar dâhil) teslim edilmemesi ve bu nedenle araç bedelinin sigortadan tahsil edilememesi durumda D maddesi iii bendi uygulanacaktır.
v)	Kanunen geçerli bir belge karşılığında, aracın teslim edildiği otopark, oto yıkama, tamirhane vb. işletmelerden aracın çalınması veya çalınmaya teşebbüs edilmesi sonucu meydana gelecek sigortacının karşılamadığı hasarların tamamından MÜŞTERİ sorumludur. 
Araç anahtarının kaybolması veya çalınması nedeni ile Aracın güvenliğini sağlamak için anahtarın kopyalanması, alarm ve immobilizerin yeniden kodlanması veya kilit sisteminin değiştirilmesi kasko sigorta poliçesi teminatı altındadır (Resmi kurumlardan ve kamu kuruluşlarından alınacak ve sigorta firması tarafından kabul edilecek belge ile geçerlidir).
Araç içinde veya üzerinde çalınmaya müsait airbag, radyo-teyp, jant, jant kapağı, anten, stepne, arma, silecek kolu, benzin depo kapağı vs. gibi parçaların çalınması halinde muhakkak resmi kurumlardan alınacak belge gerekli olup bu tip hasarlar beyanla karşılanmayacaktır.
Sahte rapor, LENACARS’a bildirilmemiş kazalar, gerçeğe aykırı olarak bildirilmiş (kaza tutanağı olmasına rağmen, beyan hakkı kullanmak maksadıyla) kazalara ait bilgiler, alkollü veya ehliyetsiz araç kullanılması, kaza yerinin terk edilmesi, kaza saatinden en geç 1 saat içinde alkol raporu alınmaması vb. hallerde, meydana gelecek hasar toplamları araçta oluşacak değer kaybı ve aracın tamiri için geçen sürede işleyen kira bedelleri ile 3. kişilere verilmiş maddi manevi zararlar MÜŞTERİ tarafından karşılanacaktır. 
Taraflar, trafik kaza raporlarında, MÜŞTERİ kullanıcısının herhangi bir miktar veya şekilde alkollü olarak belirtilmesi halinde oluşacak hasarların ve onarım için geçecek sürelerde işleyecek kira bedellerinin MÜŞTERİ tarafından ödeneceği hususunda anlaşmışlardır. Ayrıca, bu ve bunun gibi kullanıcının kötü kullanımı ve/veya ihmali sonucu ortaya çıkan durumlarda MÜŞTERİ’ye muadil araç verilmez, ancak MÜŞTERİ’nin muadil araç talep etmesi halinde MÜŞTERİ, muadil araç için de ayrıca kira bedeli ödeyecektir. Sigorta kapsamı dışında oluşacak her türlü kaza ve hasar durumlarında, LENACARS sigortaya başvuru yapmak zorunda olmadan, araçta oluşan hasarları ve araç değer kaybını doğrudan MÜŞTERİ ye fatura edecek ve söz konusu fatura (5) gün içerisinde MÜŞTERİ tarafından LENACARS’a nakden ve defaten ödenecektir. 
Sahte rapor, LENACARS’a hiç bildirilmemiş kazalar, gerçeğe aykırı olarak bildirilmiş kazaların tespiti halinde MÜŞTERİ’ye ilgili aracın 1 kira bedeli kadar gerçeğe aykırı bildirim nedeniyle cezai şart bedeli fatura edilecek olup, MÜŞTERİ tarafından ilgili cezai şart bedeli (5) gün içerisinde LENACARS’a nakden ve defaten ödenecektir.
Kiralanan araçların, kiralandıkları süre içinde, 3. kişilere verdikleri zararlardan doğacak her türlü maddi bedeni tazminat ve giderler LENACARS tarafından yaptırılan Zorunlu Trafik Sigortası ve İhtiyari Mali Mesuliyet kapsamında karşılanır. Sözleşme konusu araçların karıştığı kazalar nedeniyle, diğer otomobillere ve 3. kişilere karşı doğacak her türlü (zorunlu trafik sigorta poliçesinin ve ihtiyari mali mesuliyet poliçesinin teminatları dışında ve teminat limitleri üstünde kalan hallerde) zarardan MÜŞTERİ sorumlu olacaktır.
D)	Kiralanan Aracın Çalınma ve Pert Total Hale Gelmesi:
	Çalınması Durumunda:
i)	Aracın hırsızlık sonucu çalınması durumunda, sigorta şirketi poliçelerde yer alan yasal bekleme süresi olan (30) gün süresince beklenecektir. Belirtilen süre içerisinde Aracın bulunamaması halinde o gün itibariyle Araç Uzun Dönem Araç Kiralama Sözleşmesi’nin ve/veya Sipariş Onay Formu’nun bu Araç ile ilgili kısmı sona ermiş kabul edilecek ve bu Araç, Sipariş Onay Formu kapsamından çıkartılacaktır.
ii)	Aracın çalınması durumunda LENACARS’ın anlaşmalı olduğu kasko poliçesinde yer alan hükümler geçerli olacaktır. Buna uyulmayan durumlarda LENACARS’ın uğramış olduğu zararlar MÜŞTERİ’ye fatura edilecektir. 
Pert Total Hale Gelmesi Durumunda:
iii)	Aracın kaza sonucu kullanılamaz hale gelmesi durumunda ise, ilgili sigorta şirketinin ekspertiz sonucu pert-total raporu vermesi halinde Uzun Dönem Araç Kiralama Sözleşmesi’nin ve/veya Sipariş Onay Formu’nun bu Araç ile ilgili hükümleri sona ermiş kabul edilecek ve geçici araç iade alınarak o gün itibariyle bu araç Uzun Dönem Araç Kiralama Sözleşmesi’nin ve/veya Sipariş Onay Formu’nun kapsamından çıkartılacaktır.
iv)	Kiralamaya konu olan Araçlardan herhangi birinin çalınması veya pert-total olması halinde, sigorta tazminatının MÜŞTERİ’den kaynaklanan herhangi bir nedenle sigorta şirketi tarafından haklı ve kanuni sebeplerden ötürü ödenmemesi durumunda, MÜŞTERİ’nin bu Araç ile ilgili maddi sorumluluğu sigorta şirketlerinin kullandığı eksper tarafından tespit edilen 2. el rayiç değerdir. Şu kadar ki, Eksper tarafından tespit edilen bu değerin LENACARS’ın bu Araç ile ilgili kredi borcundan düşük olması halinde, MÜŞTERİ’nin maddi sorumluluğu, Aracın kullanımından kaynaklanan her türlü hukuki, cezai ve idari tazminat sorumluluğu hariç olmak üzere, eksper tarafından tespit edilen 2. el rayiç değeri ile sınırlıdır. Hasarın sigorta şirketi tarafından reddedildiğine ilişkin yazı bu hallerin varlığının kabulüne yeterli olacaktır ve MÜŞTERİ bu bedeli LENACARS’ın ilk yazılı ihbarında nakden/hesaben ve defaten ödeyecektir.
v)	Alkollü araç kullanılması, ehliyetsiz araç kullanılması, kullanıcının kaza yerini terk etmesi veya kaza saatinden en geç 1 saat içinde alkol raporu alınmaması vb. hallerde meydana gelmiş/gelecek hasar neticesinde aracın pert kabul edilmesi durumunda; aracın üretici firmasının belirlediği güncel anahtar teslim (sıfır) bedeli üzerinden sovtaj-hurda bedeli düşülerek bakiye miktar MÜŞTERİ’ye fatura edilecek ve bu bedel MÜŞTERİ tarafından (5) gün içerisinde LENACARS’a nakden ve defaten ödenecektir.
vi)	İş bu sözleşme konusu aracın/araçların karıştığı kazalar nedeniyle, araçta doğacak değer kaybını LENACARS’a ödeyecektir. Ayrıca MÜŞTERİ nin kusurlu olduğu durumlarda aracın pert olması halinde, aracın güncel ve hasarsız rayiç değeri ile pert hali arasındaki % 20 değer kaybı MÜŞTERİ ye yansıtılacaktır. LENACARS, 3. Şahıslara veya sigorta şirketlerine herhangi bir tazminat ödemek zorunda kalırsa, MÜŞTERİ bu tazminatı ve yargılama giderleri, avukatlık ücreti gibi her türlü ek masrafları LENACARS’a ilk taleple birlikte derhal ödemeyi kabul ve taahhüt eder. Bu gibi durumlarda LENACARS aleyhine açılan tüm davalar MÜŞTERİ’ye ihbar edilir. MÜŞTERİ’nin LENACARS yanında davaya katılması ve savunma yapması gerektiğini MÜŞTERİ peşinen kabul eder. 

E)	Fiyat ayarlaması

Taraflar Uzun Dönem Araç Kiralama Sözleşmesi kapsamında düzenlenecek her türlü poliçenin her yıl yenileneceğini, genel şart değişiklikleri, mevzuat değişiklikleri, teminat değişiklikleri ve poliçe fiyatı değişikliklerinin kendilerini bağladığını, yenilenen/değişen şart ve fiyatlarla bağlı olduklarını kabul, beyan ve taahhüt etmiştir.

Söz konusu poliçelerden kasko poliçesinin yenilenmesinde uygulanacak fiyat, sigorta şirketi tarafından ilgili poliçenin geçmiş dönemine ait hasar (ödenen hasar+muallak hasar) / kazanılmış prim oranına göre tespit edilecektir. Olası tutar veya koşul, teminat değişiklikleri Müşteri’ye LENACARS tarafından bildirilecektir. MÜŞTERİ kasko veya sigorta tutarlarında yaşanan ve kendisine LENACARS tarafından belirtilecek tutarları ödeyecektir. Kasko muafiyet tutarlarının değişmesi halinde LENACARS’ın MÜŞTERİ’ye bilgi vermesi yeterli olacaktır.   

EK-2 BAKIM VE ONARIM HİZMET SÖZLEŞMESİ

İşbu “Bakım ve Onarım Hizmet Sözleşmesi EK-2” UZUN DÖNEM ARAÇ KİRALAMA Sözleşmesi’nin eki ve ayrılmaz bir parçasıdır. Aksi işbu EK-2’de belirtilmedikçe UZUN DÖNEM ARAÇ KİRALAMA Sözleşmesi’nde kullanılan tanımlar bu metinde de geçerlidir.
1.	LENACARS aşağıda belirtilenleri taahhüt etmektedir:

A.	Araçlarla ilgili periyodik bakım hizmetleri LENACARS tarafından yapılacaktır. Araçların periyodik bakım zamanları araç üreticilerinin belirttiği kilometrelerde (bakım kilometre periyodunun maksimum %10’ u aşılabilir) yapılacak ve bakım kilometreleri MÜŞTERİ tarafından takip edilecektir. MÜŞTERİ, periyodik bakım zamanı gelen aracı ve/veya bakım kilometre zamanı gelmemiş olsa bile ilgili aracı yılda bir kez (maksimum 1 ay aşım opsiyonlu) periyodik bakım için LENACARS’ın belirttiği servise getirecektir. Aksi halde, periyodik bakımların üretici firmaların ön gördüğü kilometrelerde (veya garanti bakım kartında yer alan kilometrelerde vs.) yaptırılmaması neticesinde meydana gelebilecek her türlü arıza, hasar ücretlerinden MÜŞTERİ sorumlu olacağı gibi MÜŞTERİ ücretsiz bakım hakkını kaybedecek ve bakım ücreti MÜŞTERİ tarafından karşılanacaktır. Ayrıca, araç bakımlarının zamanında yaptırılmaması nedeniyle aracın/araçların garanti kapsamı dışına çıkması halinde doğacak bakım, onarım ücretlerinden de, MÜŞTERİ sorumlu olacaktır.

B.	Araçların sadece yapılması gereken periyodik bakımları ve kontrolleri ile ilgili servis hizmetlerinin bedelleri LENACARS’ a aittir. LENACARS, bu servis ve hizmetleri LENACARS bildireceği diğer servis noktalarında verecektir. 

C.	LENACARS’ın bildirdiği servis noktalarının dışında bir yerde acil bakım ihtiyacı söz konusu olur ise, bu ihtiyaç LENACARS’dan alınacak yazılı onay ile gerçekleştirilebilecektir. MÜŞTERİ, acil durumlarda onay alarak gittiği servis hizmetinin ücretini ödeyecek ve bu faturayı LENACARS adına alarak LENACARS’a faturayı ibraz edecektir. Bu hizmetlerin bedelleri de LENACARS tarafından ödenecektir.

D.	MÜŞTERİ tarafından olağan periyodik bakım için servise getirilen araç, en geç 48 saat içinde bakımı yapılarak kullanıcıya teslim edilecektir.

E.	Kiralanan araç, olağan periyodik bakım ihtiyacından farklı bir arıza için servise getirilmiş ise ve bu arıza 48 saatten önce tamir edilerek geri verilemiyorsa, araç kira ücreti gün üzerinden hesaplanacak ve aracın serviste kaldığı süre içerisinde (MÜŞTERİ tarafından kullanılmadığı için) bu tutar MÜŞTERİ’nin aylık kira tutarından düşülecektir. 

F.	LENACARS, bakım ve/veya onarımı tamamlanan aracın teslime hazır onarılıp tamir edilmiş olduğunu sözlü ve/ veya e-posta marifetiyle MÜŞTERİ’ ye bildirecek, MÜŞTERİ de, bu bildirimden sonra en geç 6 saat içerisinde bakım veya onarımı tamamlanan aracı teslim alacaktır.  Aksi halde, MÜŞTERİ, işbu sözleşmeyle kiraladığı aracın kira bedelini ödemeye devam edecektir. 

G.	Sözleşme genel hükümlerindeki MÜŞTERİ yükümlülüklerinin tamamı, MÜŞTERİ ye kasko onarımı doğrultusunda kasko şirketi tarafından verilen muadil araçlar için de aynen geçerlidir.

H.	Lastik değişimleri her 60.000 km de bir takım (4 adet yaz lastiği) olarak yapılacak, lastik ve değişim ücreti LENACARS e ait olacaktır. 60000 km. ve katları dışında lastik değişiminin gerektiği hallerde lastik değişimleri MÜŞTERİ tarafından yaptırılacaktır. Lastik değişiminin LENACARS tarafından yapılması istenirse, değişim ücrete tabii olacaktır. Araçların iadesi sırasında kısmen kullanılmış lastikler de geri iade edilecektir. 
Sözleşme kapsamında kiralanan araçlar için kış lastiği talep edildiği takdirde, bu değişimlere ait tüm masraflar MÜŞTERİ tarafından karşılanacaktır.
Süresinden önce ve/veya süresinde gerçekleşen tüm lastik değişimlerinde, değişen lastiklerin muhafazası MÜŞTERİ tarafından sağlanacaktır.



2.	Aşan Bakım ve MÜŞTERİ sorumluluğu:

A.	Hizmet düzeyine göre LENACARS tarafından Araçta gerçekleştirilmesi gereken bakım dışında bütün aşan bakım (“Aşan Bakım”) için MÜŞTERİ’nin yazılı talebi aranacak, söz konusu Aşan Bakım masrafı tamamen MÜŞTERİ’nin sorumluluğunda olup buna dair MÜŞTERİ’ye fatura düzenlenecektir. MÜŞTERİ, faturayı tebliğ almasından itibaren (5) gün içerisinde ilgili bedeli nakden/hesaben ve defaten ödeyecektir.

B.	Kullanım hataları ve otomotiv üreticileri tarafından verilen ve kullanım kitapçıklarında belirtilen garanti kapsamına alınmayan mekanik parça değişim ve işçilikleri aşağıda açıklanmıştır. Aşağıda belirtilen hususlarda meydana gelecek kullanım hataları ve/veya garanti kapsamına girmeyen parça değişimleri için Aracın bakım/tamir gördüğü servisinden alınacak rapor ile MÜŞTERİ’ye fatura düzenlenecektir. Şu kadar ki; aşağıda belirtilmemekte birlikte servis raporunda kullanım hatası kapsamına giren parça değişimleri ve sair masrafların ödemesi de MÜŞTERİ’nin sorumluluğunda olacak ve ilgili bedellere dair MÜŞTERİ’ye fatura düzenlenecektir. Bu hususların tespiti bakımından ister e-posta iletisi yolu ile alınmış olsun ister yazılı belge alınmış olsun Taraflar, yetkili servis raporunun yeterli ve geçerli bir delil olduğu hususunda mutabakat sağlamış olup MÜŞTERİ bu rapora herhangi bir itirazı olmayacağını peşinen kabul etmiştir.

i.	Patlayan lastiklerin tamir masrafları ile Aracın patlak lastik üzerinde yürütülmesinden kaynaklanan her türlü maliyetler ve işçilik ücretleri,

ii.	Üretici markanın uygun görmediği ve kötü yakıt (düşük oktanlı benzin veya kalitesiz motorin) kullanımından kaynaklanan yakıt sistemi ile ilgili değişecek olan tüm parçalar (pompa, enjektör, depo temizliği ve değişimi vs. gibi) 

iii.	Yanlış yakıt konulmasından kaynaklanan tüm masraflar (Dizel araca benzin; benzinli araca dizel alınması gibi)

iv.	İstiap haddi üzerinde mal – insan v.s. taşınması nedeni ile oluşan tüm hasarlar, (Amortisör patlaması, makas kırılması, vs.)

v.	Yüksek ısı sonucu hasar gören volant bedelleri,

vi.	Hatalı zincir kullanımından meydana gelen hasarlar (Ön takım ve elektronik parçalar, çamurluk ve davlumbazı, hidrolik direksiyon pompası v.s.),

vii.	Periyodik kilometre bakımlarının yapılmamasından ya da geç yapılmasından dolayı garanti kapsamında değiştirilemeyen tüm yedek parça ve işçilikler,

viii.	Araç içi torpido üzeri ve havalandırma sistemine takıların koku aparatlarının ve spreylerin vermiş olduğu zararlar ayrıca iç döşemede yapılan tahribat (sigara yanıkları, kesilme, anten kırılması vs.)

ix.	Taşıtlar üzerinde (karoserinde) demir tozu, reçine, dış cephe (akrilik dış cephe bina boyası) boyalarından sebep olacak Araç boya masrafları ve/veya boya koruma sistemleri,

x.	Araçların rutin periyodik bakımlarında değişmesi gereken parçalar ve bunların işçilik bedelleri LENACARS’a ait olan masraflardır. Kiralanan araçların rutin periyodik bakımlarında değişmesi gereken parçalar ve bunların işçilik bedelleri dışında ortaya çıkan arızalar, özensiz, kötü kullanım ve harici etkenler neticesinde meydana gelen masraflar ve araçta oluşacak değer kaybı MÜŞTERİ tarafından karşılanacaktır,

Örneğin:
75.000 kilometreden önce debriyaj balatası değişimi, aracın özensiz kullanılması (kasislere sert girilmesi, lastik ve jantın darbe alması, istiap haddinin aşılması vs.) neticesinde oluşan her türlü lastik, jant, amortisör, rot, rotil, ön takım vs. arıza ve hasarlar,
Yakıt kaynaklı olan her türlü arıza (enjektör, yakıt pompası, EGR valfi vs.) ve hasar onarımları, aracın iç aksamlarında meydana gelen (örneğin; koltukların kırılması, yırtılması, sigaradan yanması, havalandırma ızgaralarının, kumanda kollarının ve düğmelerinin kırılması, CD çaların zorlanması vs.) her türlü hasarlar.

C.	Ayrıca, MÜŞTERİ tarafından servislerden satın alınarak firmamıza fatura ettirilmiş (Paspas-hoparlör, jant kapakları, arma v.s. ile Araç tesliminde MÜŞTERİ’ye teslim edilen avadanlıkların (Zincir, trafik seti, pas pas, yangın söndürücü, park sensörü v.s gibi) kayıp edilmesi ve/veya satın alınması) aksesuar alım masraflarına dair LENACARS tarafından MÜŞTERİ adına yansıtma faturası düzenlenecektir.

Madde 1. de belirtilen bakım ve diğer hizmetlerin gerçekleştirilmesi için;

MÜŞTERİ ayrıca aşağıda belirtilenleri gerçekleştireceğini kabul etmektedir:

A.	Araçların mekanik durumuna veya dış görünümüne ilişkin yasal hükümlere uyulduğundan emin olmak,

B.	Kanun, yönetmelikler ve üretici tarafından belirtilen ve/veya bakım kitapçığında yer alan teknik kontrol ve revizyonlara Aracın gönderilmesini sağlamak,

C.	Araçta meydana gelen arıza ve/veya hasarların büyümemesi için gerekli önlemleri almak, uyarı ve arıza işaretlerine uymak,

D.	LENACARS’ın Madde (E) çerçevesindeki yükümlülüklerini yerine getirmesini sağlamak için Araçlar’ı gereken sıklıkta ve LENACARS tarafından onaylanacak ve kabul edilecek tesislere ilgili işlem için götürmek,

E.	Söz konusu tamir ve hizmet işlemlerini önceden LENACARS’a bildirmek. LENACARS söz konusu tamir veya hizmet işlemlerinin gerçekleştirilmesine müsaade etmek için onay numarası tanzim ederek onaylamadıkça, MÜŞTERİ herhangi bir tamir veya hizmet masrafının gerçekleştirilmesi için LENACARS namına izin verme yetkisine sahip olmayacaktır. Onayı alınmış tüm masraflar LENACARS tarafından ödenecektir.

3.	Yedek/İkame Araç

LENACARS’ın yedek/ikame araç temini sorumluluğu bulunmamaktadır. 

...

İMZALAR

LENA MAMA YAYINCILIK TİCARET A.Ş                                MÜŞTERİ
Ad - Soyad / İmza                                                     Ad - Soyad / İmza
`;

    // Satır bazlı yazım ve sayfa geçişi
    const satirlar = fullText.split("\n");
    for (let i = 0; i < satirlar.length; i++) {
      if (i !== 0 && i % 45 === 0) doc.addPage();
      doc.text(satirlar[i], { width: 500, align: "justify" });
    }

    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));
    const fileBuffer = fs.readFileSync(tempPath);

    const { error: uploadError } = await supabase.storage
      .from("sozlesmeler")
      .upload(fileName, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) return res.status(500).json({ message: "Yükleme hatası", error: uploadError });

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sozlesmeler/${fileName}`;

    await supabase.from("sozlesmeler").insert([
      {
        musteri_adi: musteriAdi || "Boş",
        arac_model: aracModel || "Boş",
        baslangic_tarihi: baslangicTarihi || null,
        bitis_tarihi: bitisTarihi || null,
        fiyat: fiyat || 0,
        pdf_url: publicUrl,
      },
    ]);

    return res.status(200).json({ message: "Sözleşme oluşturuldu", url: publicUrl });
  } catch (err: any) {
    console.error("🚨 PDF oluşturma hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası", error: err?.message });
  }
}
