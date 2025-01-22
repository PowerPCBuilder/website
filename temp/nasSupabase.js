process.removeAllListeners('warning');
const { createClient } = require('@supabase/supabase-js');
const data = require('./itemDataNAS.json');

// 替换成你的 Supabase 配置
const supabaseUrl= 'https://iqoemefpfkcrhnubyknp.supabase.co';
const supabaseKey= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxb2VtZWZwZmtjcmhudWJ5a25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMDI5MjUsImV4cCI6MjA1Mjg3ODkyNX0.fH-ZlaudQX-ouZ1o7FgNrVHSDM5pGVt5cVC6SPUKUc0'

const supabase = createClient(supabaseUrl, supabaseKey);

const DEBUG_MODE = false; // 设置为 false 时会写入数据库

// 数据处理函数
const processData = (rawData) => {
  return rawData
    .filter(a => a.Brand && a['Form Factor'] && a['Form Factor'] !== 'N/A' && 
              a['Included HDD Capacity'] && a['Included HDD Capacity'] !== 'N/A')
    .map(item => {
      // 处理 Brand
      let normalizedBrand = (item.Brand || '').replace(/\s+/g, '');
      if (normalizedBrand.toUpperCase() === 'QNAP') {
        normalizedBrand = normalizedBrand.toUpperCase();
      }
      else if (normalizedBrand.toUpperCase() === 'TerraMaster'.toUpperCase()) {
        normalizedBrand = 'TerraMaster';
      } else {
        normalizedBrand = normalizedBrand.charAt(0).toUpperCase() + 
                         normalizedBrand.slice(1).toLowerCase();
      }
      
      // 处理 Model
      const normalizedModel = (item.Model || '').toUpperCase().trim();
      
      // 处理 Form Factor
      let formFactor = item['Form Factor'].split(';')[0];
      const bayMatch = formFactor.match(/(\d+)(?:-)?bay/i);
      formFactor = bayMatch ? `${bayMatch[1]} Bay` : formFactor;
      
      // 处理日期
      const dateFirstAvailable = item['Date First Available'] 
        ? new Date(item['Date First Available']).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          }).replace(/-/g, '/')
        : null;

      // 处理 Drive Compatibility 和 Power Consumption
      const driveCompatibility = (item['Drive Compatibility'] || '').replace(/<br>/g, ', ');
      const powerConsumption = (item['Power Consumption'] || '').replace(/<br>/g, ', ');

      // 处理 HDD Interface
      const hddInterface = (item['HDD Interface'] || '')
        .replace(/\(drives not included\)/gi, '')
        .replace(/(\d+)\s*bay/gi, '($1 x Bay)')
        .trim();

      return {
        item: `${normalizedBrand} ${normalizedModel} ${item['Included HDD Capacity']}`.trim(),
        formFactor,
        installedMemory: item['Installed Memory'],
        driveCompatibility,
        brand: normalizedBrand,
        model: normalizedModel,
        hddInterface,
        processor: item['Processor'],
        maxMemoryCapacity: item['Max Memory Capacity'],
        memorySlot: item['Memory Slot'],
        maxCapacity: item['Max Capacity'],
        power: item['Power'],
        powerConsumption,
        dateFirstAvailable,
        description: item['description'],
        rating: item['rating'],
        reviewCount: item['reviewCount'],
        price: item.price,
        promoText: item['PromoText'],
        itemNumber: item.itemNumber
      };
    });
};

const insertData = async (processedData) => {
  if (DEBUG_MODE) {
    console.log('调试模式 - 处理后的数据:');
    console.log(JSON.stringify(processedData, null, 2));
    return;
  }

  try {
    // 找出重复的项目
    const itemCounts = processedData.reduce((acc, curr) => {
      acc[curr.item] = (acc[curr.item] || 0) + 1;
      return acc;
    }, {});

    const duplicates = Object.entries(itemCounts)
      .filter(([_, count]) => count > 1)
      .map(([item]) => {
        return {
          item,
          records: processedData.filter(record => record.item === item)
        };
      });

    if (duplicates.length > 0) {
      console.log('\n发现重复项目:');
      duplicates.forEach(({ item, records }) => {
        console.log(`\n项目: ${item}`);
        console.log('重复记录:');
        records.forEach((record, index) => {
          console.log(`记录 ${index + 1}:`, {
            itemNumber: record.itemNumber,
            brand: record.brand,
            model: record.model,
            price: record.price,
            item: record.item
          });
        });
      });
    }

    // 去重处理：使用 item 作为键
    const uniqueData = Object.values(
      processedData.reduce((acc, item) => {
        acc[item.item] = item;
        return acc;
      }, {})
    );

    console.log(`\n原始数据数量: ${processedData.length}`);
    console.log(`去重后数据数量: ${uniqueData.length}`);
    console.log(`重复项目数量: ${duplicates.length}`);

    const { data, error } = await supabase
      .from('nas')
      .upsert(uniqueData, {
        onConflict: 'item'
      });

    if (error) throw error;
    console.log('数据成功写入 Supabase');
  } catch (error) {
    console.error('写入数据时出错:', error);
  }
};

// 执行数据处理和插入
const processedData = processData(data);
insertData(processedData); 