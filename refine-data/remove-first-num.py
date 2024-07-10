import csv

from aifc import open

input_file = 'C:\\Users\\김혜경\\Documents\\pov\\src\\data\\timeSeriesVal.csv'
output_file = 'output.csv'

# 원하는 열의 인덱스를 지정
columns_to_keep = [0, 1, 2, 3, 5, 6, 7, 8, 9]

with open(input_file, 'r', newline='') as f_input, \
        open(output_file, 'w', newline='') as f_output:
    csv_reader = csv.reader(f_input)
    csv_writer = csv.writer(f_output)

    for row in csv_reader:
        # 각 행에서 원하는 열만 선택
        selected_columns = [row[i] for i in columns_to_keep]
        csv_writer.writerow(selected_columns)

print("추출이 완료되었습니다.") # type: ignore
