#_*_coding:utf-8 _*_
# node 에서 파이썬을 실행시킨 결과의 한글이 깨져서 나옴 - 아직 미해결
# 

 
from konlpy.tag import Okt
import pymysql
import io
import json
from collections import OrderedDict
import sys
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding = 'utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding = 'utf-8')
if len(sys.argv) > 1:
    inquiry = ' '.join(sys.argv[1:])
#     inquiry = u'{\"inquiry\":\"등록 어케해?\"}'

#     json_data = json.loads(inquiry)
    inquiry_sentence = inquiry
    extracted = []

    okt = Okt()
    extracted.extend(okt.phrases(inquiry_sentence))

    localhost = '114.71.137.109'
    user = 'root'
    password = 'tmvlflt1234'

    conn = pymysql.connect(host=localhost,
                           user=user,
                           password=password)

    with conn.cursor() as cs:
        sql = 'INSERT INTO chatbot.log_Inquiry (sentence, keyword) VALUES (\'{0}\', \'{1}\')'
        cs.execute(sql.format(inquiry_sentence, '^'.join(extracted)))
        conn.commit()

    for keyword in extracted:
        with conn.cursor() as cs:
            key_idx: int
            key_count: int
            sql = 'SELECT idx, count FROM chatbot.log_counter WHERE keyword = \'{0}\''
            cs.execute(sql.format(keyword))
            result = cs.fetchall()

            if len(result) > 0:
                for row in result:
                    key_idx = int(row[0])
                    key_count = int(row[1])
                sql = 'UPDATE chatbot.log_counter SET count = {0} WHERE idx = {1}'
                cs.execute(sql.format(key_count + 1, key_idx))
                conn.commit()
            else:
                sql = 'INSERT INTO chatbot.log_counter (keyword, count) VALUES (\'{0}\', {1})'
                cs.execute(sql.format(keyword, 1))
                conn.commit()

    response_data = []
    for keyword in extracted:
        with conn.cursor() as cs:
            sql = 'SELECT idx, group_no, group_title,content FROM chatbot.data_dictionary WHERE chapter_title LIKE \'%{0}%\' OR group_title LIKE \'%{0}%\''
            cs.execute(sql.format(keyword))
            result = cs.fetchall()

            temp_data = {}
            for row in result:
                temp_data['indexNo'] = row[0]
                temp_data['groupNo'] = row[1]
                temp_data['groupTitle'] = row[2]
                temp_data['content'] = row[3]

                for store in response_data:
                    if temp_data['indexNo'] == store['indexNo']:
                        break
                else:
                    response_data.append(temp_data.copy())

                temp_data.clear()

    # 최종 결과형식은 response_data
    str_res_date = ''
    idx = 1
    for rd in response_data:
        str_res_date = str_res_date + '\'Data' + str(idx) + '\':' + str(rd) + ','
        idx += 1

    print('{' + str_res_date[:-1].replace('\'', '\"') + '}')
else:
    print('필수 파라미터 값이 비어있습니다.')