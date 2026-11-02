from pathlib import Path
import subprocess,json,csv
root=Path(__file__).parent
data=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./resources/vocabulary.js')))"],cwd=root).decode('utf-8'))
with (root/'resources/vocabulary.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f);w.writerow(['主題','英文','縮寫','中文','簡單英文解釋'])
 for v in data['VOCABULARY']:w.writerow([data['CATEGORIES'][v['category']],v['en'],v['abbr'],v['zh'],v['definition']])
print('Exported',len(data['VOCABULARY']),'vocabulary entries')
