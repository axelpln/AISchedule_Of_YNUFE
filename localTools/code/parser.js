/**
 * @desc 以周或空格为界，进行分割，且分割符号前后有单双周标记，没有默认为全周
 * @param Str : String : 如：1-6,7-13周(单)
 * @returns {Array[]} : 返回数组
 * @example
 * getWeeks("1-6,7-13周(单)")=>[1,3,5,7,9,11,13]
 */
function getWeeks(Str) {
  function range(con, tag) {
      let retWeek = [];
      con.slice(0, -1).split(',').forEach(w => {
          let tt = w.split('-');
          let start = parseInt(tt[0]);
          let end = parseInt(tt[tt.length - 1]);
          if (tag === 1 || tag === 2) retWeek.push(...Array(end + 1 - start).fill(start).map((x, y) => x + y).filter(f => {
              return f % tag === 0;
          }))
          else retWeek.push(...Array(end + 1 - start).fill(start).map((x, y) => x + y).filter(v => {
              return v % 2 !== 0;
          }))
      })
      return retWeek;
  }

  Str = Str.replace(/[(){}|第\[\]]/g, "").replace(/到/g, "-");
  let reWeek = [];
  let week1 = [];
  while (Str.search(/周|\s/) !== -1) {
      let index = Str.search(/周|\s/);
      if (Str[index + 1] === '单' || Str[index + 1] === '双') {
          week1.push(Str.slice(0, index + 2).replace(/周|\s/g, ""));
          index += 2;
      } else {
          week1.push(Str.slice(0, index + 1).replace(/周|\s/g, ""));
          index += 1;
      }

      Str = Str.slice(index);
      index = Str.search(/\d/);
      if (index !== -1) Str = Str.slice(index);
      else Str = "";

  }
  if (Str.length !== 0) week1.push(Str);
  console.log(week1);
  week1.forEach(v => {
      console.log(v);
      if (v.slice(-1) === "双") reWeek.push(...range(v, 2));
      else if (v.slice(-1) === "单") reWeek.push(...range(v, 3));
      else reWeek.push(...range(v + "全", 1));
  });
  return reWeek;
}

/**
* @param Str : String : 如: 1-4节 或 1-2-3-4节
* @returns {Array[]}
* @example
* getSection("1-4节")=>[1,2,3,4]
*/
function getSection(Str) {
  let reJc = [];
  let strArr = Str.replace("节", "").trim().split("-");
  if (strArr.length <= 2) {
      for (let i = Number(strArr[0]); i <= Number(strArr[strArr.length - 1]); i++) {
          reJc.push( Number(i));
      }
  } else {
      strArr.forEach(v => {
          reJc.push(Number(v));
      })
  }
  return reJc;
}

/**
* @desc 尝试将冲突课程进行合并
* @param result {object} 原始课程JSON
* @returns {Array[]} 合并后JSON
*/
function resolveCourseConflicts(result) {
  let splitTag="&" //重复课程之间的分割标识
//将课拆成单节，并去重
  let allResultSet = new Set()
  result.forEach(singleCourse => {
      singleCourse.weeks.forEach(week => {
          singleCourse.sections.forEach(value => {
              let course = {sections: [], weeks: []}
              course.name = singleCourse.name;
              course.teacher = singleCourse.teacher==undefined?"":singleCourse.teacher;
              course.position = singleCourse.position==undefined?"":singleCourse.position;
              course.day = singleCourse.day;
              course.weeks.push(week);
              course.sections.push(value);
              allResultSet.add(JSON.stringify(course));
          })
      })
  })
  let allResult = JSON.parse("[" + Array.from(allResultSet).toString() + "]").sort(function (a, b) {
      //return b.day - e.day;
      return (a.day - b.day)||(a.sections[0]-b.sections[0]);
  })

  //将冲突的课程进行合并
  let contractResult = [];
  while (allResult.length !== 0) {
      let firstCourse = allResult.shift();
      if (firstCourse == undefined) continue;
      let weekTag = firstCourse.day;
      for (let i = 0; allResult[i] !== undefined && weekTag === allResult[i].day; i++) {
          if (firstCourse.weeks[0] === allResult[i].weeks[0]) {
              if (firstCourse.sections[0] === allResult[i].sections[0]) {
                  let index = firstCourse.name.split(splitTag).indexOf(allResult[i].name);
                  if (index === -1) {
                      firstCourse.name += splitTag + allResult[i].name;
                      firstCourse.teacher += splitTag + allResult[i].teacher;
                      firstCourse.position += splitTag + allResult[i].position;
                      allResult.splice(i, 1);
                      i--;
                  } else {
                      let teacher = firstCourse.teacher.split(splitTag);
                      let position = firstCourse.position.split(splitTag);
                      teacher[index] = teacher[index] === allResult[i].teacher ? teacher[index] : teacher[index] + "," + allResult[i].teacher;
                      position[index] = position[index] === allResult[i].position ? position[index] : position[index] + "," + allResult[i].position;
                      firstCourse.teacher = teacher.join(splitTag);
                      firstCourse.position = position.join(splitTag);
                      allResult.splice(i, 1);
                      i--;
                  }

              }
          }
      }
      contractResult.push(firstCourse);
  }
  //将每一天内的课程进行合并
  let finallyResult = []
  while (contractResult.length != 0) {
      let firstCourse = contractResult.shift();
      if (firstCourse == undefined) continue;
      let weekTag = firstCourse.day;
      for (let i = 0; contractResult[i] !== undefined && weekTag === contractResult[i].day; i++) {
          if (firstCourse.weeks[0] === contractResult[i].weeks[0] && firstCourse.name === contractResult[i].name && firstCourse.position === contractResult[i].position && firstCourse.teacher === contractResult[i].teacher) {
              if (firstCourse.sections[firstCourse.sections.length - 1] + 1 === contractResult[i].sections[0]) {
                  firstCourse.sections.push(contractResult[i].sections[0]);
                  contractResult.splice(i, 1);
                  i--;
              } else break
          }
      }
      finallyResult.push(firstCourse);
  }
  //将课程的周次进行合并
  contractResult = JSON.parse(JSON.stringify(finallyResult));
  finallyResult.length = 0;
  while (contractResult.length != 0) {
      let firstCourse = contractResult.shift();
      if (firstCourse == undefined) continue;
      let weekTag = firstCourse.day;
      for (let i = 0; contractResult[i] !== undefined && weekTag === contractResult[i].day; i++) {
          if (firstCourse.sections.sort((a,b)=>a-b).toString()=== contractResult[i].sections.sort((a,b)=>a-b).toString() && firstCourse.name === contractResult[i].name && firstCourse.position === contractResult[i].position && firstCourse.teacher === contractResult[i].teacher) {
              firstCourse.weeks.push(contractResult[i].weeks[0]);
              contractResult.splice(i, 1);
              i--;
          }
      }
      finallyResult.push(firstCourse);
  }
  console.log(finallyResult);
  return finallyResult;
}

function scheduleHtmlParser(html) {
    //除函数名外都可编辑
    //传入的参数为上一步函数获取到的html
    //可使用正则匹配
    //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
    //以下为示例，您可以完全重写或在此基础上更改



    let $ = cheerio.load(html, {decodeEntities: false});
    let result = [];
    let message = "";
  
    try {
        $('tbody tr').each(function (jcIndex, _) {
            $(this).children("td").each(function (day, _) {
                let kc = $(this).children('div[class="kbcontent"]');
                if (kc.text().length <= 6) {
                    return;
                }
                let re = {weeks: [], sections: []};
                let kcco = kc.html().split(/<br>/);
                let nameTag = true;
                let nameAfter = 1;
  
                kcco.forEach(con => {
                    $ = cheerio.load(con, {decodeEntities: false});
                    if ($("body").text().trim().length === 0) return;
  
                    // 获取 div 的 id 属性
                    let id = kc.attr('id');
                    if (id) {
                        // 分割 id 字符串，获取第二个字段（星期几）
                        let parts = id.split('_');
                        if (parts.length > 1) {
                            let dayField = parts[1];
                            switch (dayField) {
                                case '1':
                                    re.day = 1;
                                    break;
                                case '2':
                                    re.day = 2;
                                    break;
                                case '3':
                                    re.day = 3;
                                    break;
                                case '4':
                                    re.day = 4;
                                    break;
                                case '5':
                                    re.day = 5;
                                    break;
                                case '6':
                                    re.day = 6;
                                    break;
                                case '7':
                                    re.day = 7;
                                    break;
                            }
                        }
                    }
  
                    let font = $("body").children("font");
                    if (font.length > 1) {
                        if (font.eq(0).attr("title") == "教学楼") {
                            let jxlName = font.eq(0).text().replace(/【|】/g, "");
                            if (font.eq(1).text().slice(jxlName.length).search(jxlName) !== -1) {
                                font.eq(1).text(font.eq(1).text().slice(jxlName.length));
                            }
                        }
                        font = $("font").filter('[style!="display:none;"]');
                    } else if (font.length === 1 && font.attr("style") !== undefined) {
                        return;
                    }
  
                    nameAfter += 1;
                    switch (!font.attr("title") && nameAfter > 1 ? "课程" : font.attr("title")) {
                        case "课程":
                            if (nameTag) {
                                re.name = $("body").text().replace(/\([a-z]+\d+.*?\)/, "");
                                nameTag = false;
                                nameAfter = 0;
                            } else {
                                result.push(JSON.parse(JSON.stringify(re)));
                                re = {weeks: [], sections: []};
                                nameTag = true;
                            }
                            break;
                        case "老师":
                        case "教师":
                            re.teacher = font.text();
                            break;
                        case "教室":
                        case "教学楼":
                            re.position = font.text().replace(/\(.*?\)/, "");
                            break;
                        case "周次(节次)":
                            re.weeks = getWeeks(font.text().split("[")[0]);
                            let jcStr = font.text().match(/(?<=\[).*?(?=\])/g);
                            if (jcStr) re.sections = getSection(jcStr[0]);
                            else {
                                for (let jie = jcIndex * 2 - 1; jie <= jcIndex * 2; jie++) {
                                    re.sections.push(jie);
                                }
                            }
                            break;
                    }
                });
  
                if (!nameTag) {
                    result.push(JSON.parse(JSON.stringify(re)));
                    re = {weeks: [], sections: []};
                    nameTag = true;
                }
            });
        });
  
        if (result.length === 0) message = "未获取到课表";
        else result = resolveCourseConflicts(result);
    } catch (err) {
        console.error(err);
        message = err.message.slice(0, 50);
    }
  
    if (message.length !== 0) {
        result.length = 0;
        result.push({
            'name': "遇到错误，请加qq群：628325112进行反馈",
            'teacher': "开发者",
            'position': message,
            'day': 1,
            'weeks': [1],
            'sections': [{section: 1}, {section: 2}, {section: 3}]
        });
    }
  
    return result;
}
