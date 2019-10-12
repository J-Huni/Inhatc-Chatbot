var db=require('../../db')
var python=require('python-shell')
var promise=require('promise')
// const {OKT,KKMA}=require('koalanlp/API')
// var {KMR, EUNJEON} = require('koalanlp/API');
// var {initialize} = require('koalanlp/Util');
// var {Tagger, Parser} = require('koalanlp/proc');
// import { SentenceSplitter } from 'koalanlp/proc';
// import { OKT } from 'koalanlp/API';
const OpenKoreanText = require('open-korean-text-node').default;
exports.main=(req,res)=>{
        res.render('main')
}
exports.chat=async (req,res)=>{
        userText=req.body.userText
        // console.log(OpenKoreanText.normalizeSync(userText))
        data=await extraction(userText)
        // console.log(data)
        sql=await setSql(data)
        result=await getContent(sql).then((result)=>{
                return result
        })
        if(result.length){
                res.send({data:result,dataNone:false})
        }else{
                res.send({dataNone:true})
        }
        // python.PythonShell.run('Extract_Engine.py',options,(err,result)=>{
        //         if(err) {console.log(err);throw err;}
        //         else{
        //                 try {
        //                         console.log(result[0])
        //                         if(result.length){
        //                                 let chat = JSON.parse(result[0])
        //                                 res.send({data:chat,dataNone:false})
        //                         }else{
        //                                 res.send({dataNone:true})
        //                         }
        //                 } catch (error) {
        //                         console.log(error)
        //                         throw err;
        //                 }
        //         }
        // })
        // OpenKoreanText.normalize(userText).then((result)=>{
        //         console.log(result)
        // })
        // console.log(OpenKoreanText.tokenizeSync(userText))
        // someAsyncFunction(userText).then(
        //         () => console.log('After function finished'),
        //         (error) => console.error('Error occurred!', error)
        //     );
        // let options = {
        //         mode: 'text',
        //         pythonPath: '',
        //         pythonOptions: ['-u'], // get print results in real-time
        //         scriptPath: './python',
        //         args: [userText]
        //       };
}
async function setSql(data){
        sql="select idx,group_no,group_title,content from data_dictionary where "
        data.map( (token,index) => {
                if(index == 0) sql += "chapter_title like '%"+token+"%' or group_title like '%"+token+"%' "
                else sql +="or chapter_title like '%"+token+"%' or group_title like '%"+token+"%' "
        })
        return sql
}
async function getContent(sql){
        return new Promise((resolve,reject)=>{
                db.query(sql,(err,result)=>{
                        if(err) reject(err)
                        else{
                                resolve(result)
                        }
                })
        })
}
async function extraction(userText){
        data=OpenKoreanText.tokenizeSync(userText).toJSON()
        result=[]
        for(text of data){
                if(text['pos']=='Noun' && text['text'].length>1){
                        result.push(text['text'])
                }
        }
        return result
}
async function initialize(){
        OpenKoreanText.normalizeSync('테스트')
        OpenKoreanText.tokenizeSync('테스트').toJSON()
}
initialize().then(
        () => console.log('Initialized Finished'),
        (error) => console.error('Error',error)
)
// async function executor(){
//         await initialize({packages: {KMR: '2.0.4', EUNJEON: '2.0.6'}, verbose: true});
     
//         let tagger = new Tagger(KMR);
//         let tagged = await tagger("안녕하세요. 눈이 오는 설날 아침입니다.");
//         for(const sent of tagged) {
//             console.log(sent.toString());
//         }
//     }
     
// executor().then(
// () => console.log('finished!'), 
// (error) => console.error('Error Occurred!', error)
// );

// async function someAsyncFunction(text){
//     // ....
    
//     let tagger = new Tagger(EUNJEON);
//     let result = await tagger(text);
//     // 또는 tagger.tag(...) 

//     /* Result는 string[] 타입입니다. */
// //     console.log(result[0].s)
//     console.log(result[0].singleLineString()); // "문단을 분석합니다."의 품사분석 결과 출력
        
//     // ...
// }


// async function nomalize(text){
//         let tagger = new Tagger(KMR);
//         let tagged = await tagger(text);
//         for(const sent of tagged) {
//                 console.log(sent.toString());
//         }
        
//         let parser = new Parser(KKMA);
//         let parsed = await parser(text);
//         for(const sent of parsed){
//                 console.log(sent.toString());
//                 for(const dep of sent.dependencies){
//                 console.log(dep.toString());
//                 }
//         }
//         // let tagger = new Tagger(OKT);
//         // let tagged = await tagger(text);
//         // for(const sent of tagged) {
//         //     console.log(sent.toString());
//         // }
//         // let parser = new Parser(KKMA);
//         // let parsed = await parser("안녕하세요. 눈이 오는 설날 아침입니다.");
//         // for(const sent of parsed){
//         //         console.log(sent.toString());
//         //         for(const dep of sent.dependencies){
//         //         console.log(dep.toString());
//         //         }
//         // }
// }
// async function executor(){
//         // await initialize({packages: {OKT: '2.0.6.1',KKMA: '2.0.4'}, verbose: true});
//         await initialize({packages: {KMR: '2.0.4',KKMA: '2.0.4'}, verbose: true});
//         // let tagger = new Tagger(OKT);
//         // let tagged = await tagger("수업알려줘");
//         // for(const sent of tagged) {
//         //     console.log(sent.toString());
//         // }
// }
    
// executor().then(
//         () => console.log('finished!'), 
//         (error) => console.error('Error Occurred!', error)
// );