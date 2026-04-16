import datetime
import requests # Import the requests library
import json
import time
import pandas as pd
from datetime import date, timedelta

class FireAnt:
    def __init__(self, start_date=None, end_date=None, url="https://restv2.fireant.vn", token=None):
        self.start_date = start_date if start_date else datetime.date(2000, 1, 1) # Default to 2000-01-01
        self.end_date = end_date if end_date else datetime.date.today()
        self.now_day = datetime.date.today()
        self.url = url
        self.token = token

    def _make_request(self, endpoint, params=None):
        """Makes an API request to the FireAnt API."""
        full_url = f"{self.url}{endpoint}"
        headers = {'Authorization': f'Bearer {self.token}'} if self.token else {}
        print(f"Making request to {full_url} with params: {params} and headers: {headers}")
        try:
            response = requests.get(full_url, params=params, headers=headers)
            response.raise_for_status() # Raise an exception for HTTP errors
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
            return {"error": str(e), "data": []}

    def get_intraday_data(self, symbol, date=None):
        """Lấy dữ liệu intraday (hàng ngày) cho một mã chứng khoán."""
        target_date = date if date else self.now_day
        print(f"Getting intraday data for {symbol} on {target_date}")
        # Example endpoint and parameters, adjust as per FireAnt API documentation for intraday
        # This is a placeholder, actual intraday endpoint might be different
        endpoint = f"/symbols/{symbol}/intraday-quotes"
        params = {'date': target_date.strftime('%Y-%m-%d')}
        return self._make_request(endpoint, params)

    def get_realtime_data(self, symbol):
        """Lấy dữ liệu realtime cho một mã chứng khoán."""
        print(f"Getting realtime data for {symbol}")
        # Example endpoint and parameters, adjust as per FireAnt API documentation
        endpoint = f"/symbols/{symbol}/realtime-quotes"
        return self._make_request(endpoint)

    def get_full_data(self, symbol, data_type="all"):
        """Lấy toàn bộ dữ liệu cho một mã chứng khoán hoặc loại dữ liệu cụ thể.

        data_type có thể là 'price', 'industry', 'financials', 'financial_reports', 'macro', 'world', hoặc 'all'.
        """
        print(f"Getting full data for {symbol}, type: {data_type}")
        result = {}

        if data_type == "price" or data_type == "all":
            result['price'] = self._get_price_data(symbol)
        if data_type == "industry" or data_type == "all":
            result['industry'] = self._get_industry_data(symbol)
        if data_type == "financials" or data_type == "all":
            result['financials'] = self._get_company_financials(symbol)
        if data_type == "financial_reports" or data_type == "all":
            # For financial reports, we'll try to get full reports for a default year/quarter,
            # or you can call full_financial_reports directly with specific parameters.
            result['financial_reports'] = self.full_financial_reports(symbol, report_type=1, year=datetime.date.today().year, quarter=1) # Default to Balance Sheet, current year, Q1
        if data_type == "macro" or data_type == "all":
            result['macro'] = self._get_macro_data()
        if data_type == "world" or data_type == "all":
            result['world'] = self._get_world_data()

        return result

    def _get_price_data(self, symbol):
        """Helper method to get price data."""
        print(f"Retrieving price data for {symbol} from {self.start_date} to {self.end_date}")
        # Based on user's example: f"https://restv2.fireant.vn/symbols/{symbol}/historical-quotes"
        endpoint = f"/symbols/{symbol}/historical-quotes"
        params = {
            'startDate': self.start_date.strftime('%Y-%m-%d'),
            'endDate': self.end_date.strftime('%Y-%m-%d')
        }
        return self._make_request(endpoint, params)

    def _get_industry_data(self, symbol):
        """Helper method to get industry data."""
        print(f"Retrieving industry data for {symbol}")
        # Placeholder endpoint, adjust as per FireAnt API documentation
        endpoint = f"/symbols/{symbol}/industry"
        return self._make_request(endpoint)

    def _get_company_financials(self, symbol, report_type='Y', report_count=1):
        """Helper method to get company financial statements (e.g., balance sheet, income statement)."""
        print(f"Retrieving company financials for {symbol}, type: {report_type}, count: {report_count}")
        # Adjusting endpoint and params based on user's input: "financial-data?type={type}&count={count}"
        endpoint = f"/symbols/{symbol}/financial-data" # Assuming /symbols/{symbol}/ is the base path
        params = {
            'type': report_type,
            'count': report_count
        }
        return self._make_request(endpoint, params)

    def full_financial_reports(self, symbol, report_type, year, quarter):
        """Lấy báo cáo tài chính đầy đủ cho một mã chứng khoán với loại báo cáo, năm và quý cụ thể.

        report_type: 1 là cân đối kế toán, 2 là kết quả kinh doanh, 3 là lưu chuyển tiền tệ trực tiếp, 4 là lưu chuyển tiền tệ gián tiếp.
        year: năm muốn lấy.
        quarter: quý muốn lấy.
        """
        print(f"Retrieving full financial reports for {symbol} - Type: {report_type}, Year: {year}, Quarter: {quarter}")
        endpoint = f"/symbols/{symbol}/full-financial-reports"
        params = {
            'type': report_type,
            'year': year,
            'quarter': quarter
        }
        return self._make_request(endpoint, params)

    def _get_financial_reports(self, symbol):
        """Helper method to get financial reports. This now calls full_financial_reports with defaults."""
        # If the user asks for 'financial_reports' via get_full_data, we'll default to Balance Sheet, current year, Q1.
        # The user can call full_financial_reports directly for more specific needs.
        print(f"Retrieving general financial reports for {symbol} (defaulting to Balance Sheet, current year, Q1).")
        return self.full_financial_reports(symbol, report_type=1, year=datetime.date.today().year, quarter=1)

    def _get_macro_data(self):
        """Helper method to get macroeconomic data."""
        print("Retrieving macroeconomic data")
        # Placeholder endpoint, adjust as per FireAnt API documentation
        endpoint = f"/macro-data/general/info" # Example from user: /macro-data/{macro}/info
        return self._make_request(endpoint)

    def _get_world_data(self):
        """Helper method to get global market data."""
        print("Retrieving world market data")
        # Placeholder endpoint, adjust as per FireAnt API documentation
        endpoint = "/world-markets/overview"
        return self._make_request(endpoint)

    def download_stock_list(self, csv_file):
        """Downloads historical stock data for symbols listed in a CSV file using the FireAnt instance.

        Args:
            csv_file (str): Path to the CSV file containing stock symbols.
        """
        try:
            df_list = pd.read_csv(csv_file, header=None)
            symbols = df_list[0].tolist()
        except Exception as e:
            print(f"Lỗi khi đọc file CSV: {e}")
            return

        for symbol in symbols:
            symbol = symbol.strip().upper()
            if not symbol: continue

            all_data = []
            offset = 0
            limit = 1000
            endpoint = f"/symbols/{symbol}/historical-quotes"

            print(f"\n--- Đang tải mã: {symbol} ---")

            while True:
                params = {
                    "startDate": self.start_date.strftime('%Y-%m-%d'),
                    "endDate": self.end_date.strftime('%Y-%m-%d'),
                    "offset": offset,
                    "limit": limit
                }

                try:
                    response_data = self._make_request(endpoint, params)

                    if response_data and "error" in response_data:
                        print(f"  [!] Lỗi API khi tải {symbol}: {response_data['error']}")
                        break

                    data = response_data if response_data else []

                    if not data: break

                    for item in data:
                        all_data.append({
                            "time": item['date'].split('T')[0] if 'date' in item else None,
                            "open": item.get('priceOpen'),
                            "high": item.get('priceHigh'),
                            "low": item.get('priceLow'),
                            "close": item.get('priceClose'),
                            "value": item.get('totalVolume'),
                            "basic": item.get('priceBasic'),
                            "dvolume": item.get('dealVolume'),
                            "tvalue": item.get('totalValue'),
                            "ptvalue": item.get('putthroughValue'),
                            "bfquantity": item.get('buyForeignQuantity'),
                            "bfvalue": item.get('buyForeignValue'),
                            "sfquantity": item.get('sellForeignQuantity'),
                            "sfvalue": item.get('sellForeignValue'),
                            "bcount": item.get('buyCount'),
                            "bquantity": item.get('buyQuantity'),
                            "scount": item.get('sellCount'),
                            "squantity": item.get('sellQuantity'),
                            "aratio": item.get('adjRatio'),
                            "cfroom": item.get('currentForeignRoom'),
                            "ptndvalue": item.get('propTradingNetDealValue'),
                            "ptnetptvalue": item.get('propTradingNetPTValue'),
                            "ptnvalue": item.get('propTradingNetValue'),
                            "unit": item.get('unit'),
                        })

                    if len(data) < limit: break
                    offset += limit
                    time.sleep(0.3)

                except Exception as e:
                    print(f"  [!] Lỗi phát sinh: {e}")
                    break

            if all_data:
                all_data.sort(key=lambda x: x['time'] if x['time'] else '')

                filename = f"{symbol}.json"
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(all_data, f, indent=4)
                print(f"  [✓] Hoàn tất: {len(all_data)} nến -> {filename}")
            else:
                print(f"  [x] Không có dữ liệu cho mã {symbol}")

    def download_price_intraday(self, csv_file):
        """Downloads intraday data for the last 3 days for symbols listed in a CSV file
        and updates existing JSON files or creates new ones.
        """
        try:
            df_list = pd.read_csv(csv_file, header=None)
            symbols = df_list[0].tolist()
        except Exception as e:
            print(f"Lỗi khi đọc file CSV: {e}")
            return

        today = date.today()
        dates_to_fetch = [today - timedelta(days=i) for i in range(3)] # Last 3 days including today

        for symbol in symbols:
            symbol = symbol.strip().upper()
            if not symbol: continue

            filename = f"{symbol}_intraday.json"
            existing_data = []

            # Load existing data if file exists
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                print(f"  Đã tải dữ liệu cũ từ {filename} cho {symbol}")
            except FileNotFoundError:
                print(f"  Chưa có dữ liệu cũ cho {symbol}, sẽ tạo mới.")
            except json.JSONDecodeError:
                print(f"  Lỗi đọc file JSON cho {symbol}. Sẽ tạo mới hoặc ghi đè.")
                existing_data = [] # Reset if file is corrupted

            # Convert existing_data to a dictionary for easier lookup by date
            existing_data_dict = {item['time']: item for item in existing_data if 'time' in item}
            updated_dates_count = 0
            new_dates_count = 0

            print(f"\n--- Đang tải dữ liệu intraday 3 ngày gần nhất cho mã: {symbol} ---")

            for target_date in dates_to_fetch:
                print(f"  Đang tải dữ liệu cho ngày: {target_date.strftime('%Y-%m-%d')}")
                intraday_raw_data = self.get_intraday_data(symbol, date=target_date)

                if intraday_raw_data and "error" in intraday_raw_data:
                    print(f"  [!] Lỗi API khi tải dữ liệu intraday cho {symbol} ngày {target_date}: {intraday_raw_data['error']}")
                    continue

                if not intraday_raw_data:
                    print(f"  Không có dữ liệu intraday cho {symbol} ngày {target_date}.")
                    continue

                # Assuming intraday_raw_data is a list of dictionaries for the given day
                # and each dictionary has a 'date' field.
                # We'll process each item in the intraday_raw_data list
                for item in intraday_raw_data:
                    item_date_str = item.get('date', '').split('T')[0] # Extract 'YYYY-MM-DD'
                    if not item_date_str:
                        continue # Skip if no valid date found in the item

                    # Format the item to match the structure of existing historical data
                    formatted_item = {
                        "time": item_date_str,
                        "open": item.get('priceOpen'),
                        "high": item.get('priceHigh'),
                        "low": item.get('priceLow'),
                        "close": item.get('priceClose'),
                        "value": item.get('totalVolume'),
                        "basic": item.get('priceBasic'),
                        "dvolume": item.get('dealVolume'),
                        "tvalue": item.get('totalValue'),
                        "ptvalue": item.get('putthroughValue'),
                        "bfquantity": item.get('buyForeignQuantity'),
                        "bfvalue": item.get('buyForeignValue'),
                        "sfquantity": item.get('sellForeignQuantity'),
                        "sfvalue": item.get('sellForeignValue'),
                        "bcount": item.get('buyCount'),
                        "bquantity": item.get('buyQuantity'),
                        "scount": item.get('sellCount'),
                        "squantity": item.get('sellQuantity'),
                        "aratio": item.get('adjRatio'),
                        "cfroom": item.get('currentForeignRoom'),
                        "ptndvalue": item.get('propTradingNetDealValue'),
                        "ptnetptvalue": item.get('propTradingNetPTValue'),
                        "ptnvalue": item.get('propTradingNetValue'),
                        "unit": item.get('unit')
                    }

                    if item_date_str in existing_data_dict:
                        # Update existing entry for this specific date
                        existing_data_dict[item_date_str] = formatted_item
                        updated_dates_count += 1
                    else:
                        # Add new entry for this date
                        existing_data_dict[item_date_str] = formatted_item
                        new_dates_count += 1

                time.sleep(0.3) # Sleep after processing each day's data to avoid API rate limits

            # Convert back to list and sort by date for consistent storage
            final_data = sorted(existing_data_dict.values(), key=lambda x: x['time'])

            if final_data:
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(final_data, f, indent=4)
                print(f"  [✓] Hoàn tất cập nhật {updated_dates_count} ngày và thêm {new_dates_count} ngày mới cho {symbol} -> {filename}")
            else:
                print(f"  [x] Không có dữ liệu để lưu cho mã {symbol}")