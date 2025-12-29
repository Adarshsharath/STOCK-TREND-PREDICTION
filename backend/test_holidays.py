from utils.market_hours import is_market_open

def test_holidays():
    # Test for NSE
    nse_status = is_market_open(symbol="RELIANCE.NS")
    print(f"NSE Status: {nse_status}")
    
    # Test for NYSE/NASDAQ
    nyse_status = is_market_open(symbol="AAPL")
    print(f"NYSE Status: {nyse_status}")

if __name__ == "__main__":
    test_holidays()
