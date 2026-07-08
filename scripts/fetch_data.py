#!/usr/bin/env python3
"""
华为乾崑智驾数据爬取脚本
每次运行获取最新数据，并追加到历史数据文件中
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
import requests

# 配置
API_URL = "https://auto.huawei.com/external/uiapi/ads/v1/query"
DATA_DIR = Path(__file__).parent.parent / "public" / "data"
HISTORY_FILE = DATA_DIR / "history.json"
CURRENT_FILE = DATA_DIR / "current.json"

# 确保数据目录存在
DATA_DIR.mkdir(parents=True, exist_ok=True)

def fetch_api_data():
    """从 API 获取最新数据"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(API_URL, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get("code") == "200" and data.get("data"):
            return data["data"]
        else:
            print(f"API 返回异常: {data}")
            return None
    except Exception as e:
        print(f"获取 API 数据失败: {e}")
        return None

def parse_data(api_data):
    """解析 API 数据
    
    API 返回格式:
    {
        "pilot": {"value": "12620855892", "lastUpdateDate": "2026-07-08 21:50:18.000000"},
        "mileage": {"value": "36858059240", "lastUpdateDate": "2026-07-08 21:50:18.000000"},
        "avoid": {"value": "5880561", "lastUpdateDate": "2026-07-08 21:50:18.000000"}
    }
    """
    try:
        # 安全地提取数值，处理字符串类型
        pilot_val = api_data.get("pilot", {}).get("value", "0")
        mileage_val = api_data.get("mileage", {}).get("value", "0")
        avoid_val = api_data.get("avoid", {}).get("value", "0")
        
        pilot = int(str(pilot_val).strip() or 0)
        mileage = int(str(mileage_val).strip() or 0)
        avoid = int(str(avoid_val).strip() or 0)
        
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "pilot": pilot,
            "mileage": mileage,
            "avoid": avoid
        }
    except Exception as e:
        print(f"解析数据失败: {e}, api_data: {api_data}")
        return None

def load_history():
    """加载历史数据"""
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"加载历史数据失败: {e}")
            return []
    return []

def save_history(history):
    """保存历史数据"""
    try:
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
        print(f"历史数据已保存，共 {len(history)} 条记录")
    except Exception as e:
        print(f"保存历史数据失败: {e}")

def save_current(data):
    """保存当前数据"""
    try:
        with open(CURRENT_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"当前数据已保存: pilot={data['pilot']}, mileage={data['mileage']}, avoid={data['avoid']}")
    except Exception as e:
        print(f"保存当前数据失败: {e}")

def main():
    """主函数"""
    print(f"[{datetime.now().isoformat()}] 开始爬取数据...")
    
    # 获取 API 数据
    api_data = fetch_api_data()
    if not api_data:
        print("无法获取 API 数据，退出")
        sys.exit(1)
    
    print(f"API 返回数据: {api_data}")
    
    # 解析数据
    parsed_data = parse_data(api_data)
    if not parsed_data:
        print("无法解析数据，退出")
        sys.exit(1)
    
    print(f"解析后的数据: {parsed_data}")
    
    # 保存当前数据
    save_current(parsed_data)
    
    # 加载历史数据
    history = load_history()
    
    # 添加新数据到历史
    history.append(parsed_data)
    
    # 只保留最近 2880 条记录（24 小时，每 30 秒一条）
    if len(history) > 2880:
        history = history[-2880:]
    
    # 保存历史数据
    save_history(history)
    
    print(f"[{datetime.now().isoformat()}] 数据爬取完成")

if __name__ == "__main__":
    main()
