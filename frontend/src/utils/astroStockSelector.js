// Real Astrology-Based Stock Selection with Keyword Extraction & Sentiment Analysis
// This module analyzes horoscope text to intelligently select stocks

// Massive pool of 120+ Indian stocks organized by sector
export const stocksByCategory = {
    banking: [
        'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS', 'AXISBANK.NS',
        'INDUSINDBK.NS', 'BANDHANBNK.NS', 'FEDERALBNK.NS', 'IDFCFIRSTB.NS', 'PNB.NS',
        'BANKBARODA.NS', 'CANBK.NS', 'BAJFINANCE.NS', 'BAJAJFINSV.NS', 'CHOLAFIN.NS',
        'MUTHOOTFIN.NS', 'SBICARD.NS', 'HDFCLIFE.NS', 'ICICIGI.NS', 'SBILIFE.NS'
    ],

    tech: [
        'TCS.NS', 'INFY.NS', 'HCLTECH.NS', 'WIPRO.NS', 'TECHM.NS',
        'LTI.NS', 'COFORGE.NS', 'MPHASIS.NS', 'PERSISTENT.NS', 'LTTS.NS',
        'ZOMATO.NS', 'NYKAA.NS', 'PAYTM.NS', 'POLICYBZR.NS', 'DELHIVERY.NS',
        'IRCTC.NS', 'ROUTE.NS', 'EASEMYTRIP.NS', 'INOXWIND.NS', 'TATAELXSI.NS'
    ],

    consumer: [
        'HINDUNILVR.NS', 'ITC.NS', 'NESTLEIND.NS', 'BRITANNIA.NS', 'DABUR.NS',
        'MARICO.NS', 'GODREJCP.NS', 'COLPAL.NS', 'TATACONSUM.NS', 'EMAMILTD.NS',
        'VBL.NS', 'RADICO.NS', 'MCDOWELL-N.NS', 'PGHH.NS', 'GILLETTE.NS'
    ],

    auto: [
        'MARUTI.NS', 'TATAMOTORS.NS', 'M&M.NS', 'BAJAJ-AUTO.NS', 'HEROMOTOCO.NS',
        'EICHERMOT.NS', 'ASHOKLEY.NS', 'TVSMOTOR.NS', 'MOTHERSON.NS', 'BOSCHLTD.NS',
        'BALKRISIND.NS', 'MRF.NS'
    ],

    pharma: [
        'SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'DIVISLAB.NS', 'APOLLOHOSP.NS',
        'AUROPHARMA.NS', 'LUPIN.NS', 'BIOCON.NS', 'TORNTPHARM.NS', 'ALKEM.NS',
        'LAURUSLABS.NS', 'GLENMARK.NS'
    ],

    infra: [
        'LT.NS', 'ULTRACEMCO.NS', 'GRASIM.NS', 'AMBUJACEM.NS', 'ACC.NS',
        'SHREECEM.NS', 'RAMCOCEM.NS', 'JKCEMENT.NS', 'HEIDELBERG.NS', 'INDIACEM.NS'
    ],

    energy: [
        'RELIANCE.NS', 'ONGC.NS', 'NTPC.NS', 'POWERGRID.NS', 'COALINDIA.NS',
        'IOC.NS', 'BPCL.NS', 'GAIL.NS', 'ADANIGREEN.NS', 'TATAPOWER.NS'
    ],

    metals: [
        'TATASTEEL.NS', 'JSWSTEEL.NS', 'HINDALCO.NS', 'VEDL.NS', 'JINDALSTEL.NS',
        'SAIL.NS', 'NMDC.NS', 'HINDZINC.NS'
    ],

    telecom: [
        'BHARTIARTL.NS', 'IDEA.NS', 'HATHWAY.NS', 'TATACOMM.NS', 'ZEEL.NS'
    ],

    retail: [
        'DMART.NS', 'TRENT.NS', 'SHOPERSTOP.NS', 'ABFRL.NS', 'VMART.NS'
    ],

    conglomerate: [
        'ADANIENT.NS', 'ITC.NS', 'SIEMENS.NS', 'ABB.NS', 'HAVELLS.NS'
    ],

    luxury: [
        'TITAN.NS', 'ASIANPAINT.NS', 'PIDILITIND.NS'
    ]
}

// Keyword to sector mapping for horoscope analysis
const sectorKeywords = {
    tech: ['technology', 'digital', 'software', 'innovation', 'tech', 'IT', 'computer', 'internet', 'online', 'app', 'cyber', 'data'],
    banking: ['banking', 'finance', 'financial', 'money', 'wealth', 'investment', 'bank', 'loan', 'credit', 'capital'],
    consumer: ['consumer', 'retail', 'shopping', 'FMCG', 'food', 'beverage', 'household', 'grocery'],
    energy: ['energy', 'power', 'oil', 'petroleum', 'fuel', 'electricity', 'gas', 'renewable'],
    pharma: ['health', 'medical', 'pharma', 'healthcare', 'wellness', 'medicine', 'hospital', 'doctor', 'cure'],
    auto: ['automobile', 'vehicle', 'transport', 'auto', 'car', 'bike', 'motor', 'mobility'],
    infra: ['infrastructure', 'construction', 'cement', 'building', 'real estate', 'property', 'development'],
    metals: ['metal', 'steel', 'mining', 'iron', 'copper', 'aluminum', 'commodity'],
    telecom: ['telecom', 'communication', 'mobile', 'network', 'connectivity', '5G'],
    retail: ['retail', 'shopping', 'store', 'ecommerce', 'marketplace', 'commerce'],
    conglomerate: ['business', 'diversified', 'conglomerate', 'industrial', 'enterprise'],
    luxury: ['luxury', 'premium', 'lifestyle', 'fashion', 'jewelry', 'designer']
}

// Positive sentiment keywords
const positiveKeywords = [
    'invest', 'buy', 'opportunity', 'growth', 'profit', 'gain', 'rise', 'bullish',
    'favorable', 'promising', 'success', 'prosperity', 'fortune', 'lucky', 'positive',
    'excellent', 'good', 'great', 'strong', 'boost', 'improve', 'benefit', 'advantage',
    'thrive', 'flourish', 'expand', 'advance', 'progress', 'win', 'achieve'
]

// Negative sentiment keywords
const negativeKeywords = [
    'avoid', 'sell', 'risk', 'loss', 'decline', 'fall', 'bearish', 'unfavorable',
    'caution', 'warning', 'danger', 'negative', 'bad', 'weak', 'poor', 'trouble',
    'difficult', 'challenge', 'obstacle', 'problem', 'struggle', 'fail', 'decrease'
]

// Extract sectors mentioned in horoscope text
export const extractSectorMentions = (text) => {
    const lowerText = text.toLowerCase()
    const mentions = {}

    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
        let count = 0
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                count++
            }
        }
        if (count > 0) {
            mentions[sector] = count
        }
    }

    return mentions
}

// Analyze sentiment for each sector mention
export const analyzeSectorSentiment = (text, sectorMentions) => {
    const lowerText = text.toLowerCase()
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const sectorSentiments = {}

    for (const sector of Object.keys(sectorMentions)) {
        const sectorKeywordList = sectorKeywords[sector]

        // Find sentences mentioning this sector
        const relevantSentences = sentences.filter(sentence =>
            sectorKeywordList.some(keyword => sentence.toLowerCase().includes(keyword))
        )

        if (relevantSentences.length > 0) {
            let sentimentScore = 0

            relevantSentences.forEach(sentence => {
                const sentenceLower = sentence.toLowerCase()

                // Count positive keywords
                const positiveCount = positiveKeywords.filter(kw => sentenceLower.includes(kw)).length

                // Count negative keywords
                const negativeCount = negativeKeywords.filter(kw => sentenceLower.includes(kw)).length

                sentimentScore += (positiveCount - negativeCount)
            })

            sectorSentiments[sector] = sentimentScore / relevantSentences.length
        }
    }

    return sectorSentiments
}

// Main function: Generate stock recommendations from horoscope
export const generateStockRecsFromHoroscope = (horoscopeData, sign) => {
    const description = horoscopeData.description || ''
    const luckyNumber = parseInt(horoscopeData.lucky_number) || 7

    // Step 1: Extract sectors mentioned in horoscope
    const sectorMentions = extractSectorMentions(description)

    // Step 2: Analyze sentiment for each sector
    const sectorSentiments = analyzeSectorSentiment(description, sectorMentions)

    // Step 3: Check if we have enough sector data
    const hasSectorData = Object.keys(sectorSentiments).length > 0

    let up = []
    let down = []
    let method = 'hash' // Track which method was used
    let explanation = ''

    if (hasSectorData) {
        // Use real astrology data!
        method = 'astrology'

        // Sort sectors by sentiment
        const sortedSectors = Object.entries(sectorSentiments).sort((a, b) => b[1] - a[1])

        // Get positive sectors (sentiment > 0)
        const positiveSectors = sortedSectors.filter(([_, score]) => score > 0)

        // Get negative sectors (sentiment < 0)
        const negativeSectors = sortedSectors.filter(([_, score]) => score < 0)

        // Determine stock count based on lucky number
        const numLucky = 2 + (luckyNumber % 4) // 2-5 stocks
        const numUnlucky = 1 + (luckyNumber % 3) // 1-3 stocks

        // Select lucky stocks from positive sectors
        for (const [sector, score] of positiveSectors) {
            const stocks = stocksByCategory[sector] || []
            const stocksToAdd = stocks.slice(0, 2) // 2 stocks per sector
            up.push(...stocksToAdd)
            if (up.length >= numLucky) break
        }

        // Select unlucky stocks from negative sectors
        for (const [sector, score] of negativeSectors) {
            const stocks = stocksByCategory[sector] || []
            const stocksToAdd = stocks.slice(0, 2)
            down.push(...stocksToAdd)
            if (down.length >= numUnlucky) break
        }

        // Trim to exact count
        up = up.slice(0, numLucky)
        down = down.slice(0, numUnlucky)

        // Create explanation
        if (positiveSectors.length > 0) {
            const sectorNames = positiveSectors.map(([s]) => s).join(', ')
            explanation = `Based on your horoscope mentioning ${sectorNames} positively`
        }
    }

    // Return results with metadata
    return {
        up,
        down,
        method,
        sectorMentions: hasSectorData ? sectorMentions : null,
        sectorSentiments: hasSectorData ? sectorSentiments : null,
        explanation
    }
}

// Hash-based fallback (for when no sectors are mentioned)
export const generateHashBasedRecs = (horoscopeData, sign) => {
    const allStocks = Object.values(stocksByCategory).flat()

    const elementSectorBoost = {
        'Earth': ['banking', 'infra', 'conglomerate'],
        'Fire': ['energy', 'metals', 'auto'],
        'Air': ['tech', 'telecom', 'retail'],
        'Water': ['consumer', 'pharma', 'luxury']
    }

    // Create hash from horoscope data
    const moodHash = horoscopeData.mood.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colorHash = horoscopeData.color.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const luckyNumHash = parseInt(horoscopeData.lucky_number) * 7
    const compatibilityHash = horoscopeData.compatibility.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const descHash = horoscopeData.description.length * 3
    const elementHash = sign.element.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 11

    const cosmicSeed = moodHash + colorHash + luckyNumHash + compatibilityHash + descHash + elementHash

    // Shuffle with sector boosting
    const shuffleStocks = (seed) => {
        let shuffled = [...allStocks]
        let currentSeed = seed

        const boostedSectors = elementSectorBoost[sign.element] || []
        const boostedStocks = boostedSectors.flatMap(sector => stocksByCategory[sector] || [])

        if (boostedStocks.length > 0 && (currentSeed % 10) < 3) {
            const boostCount = Math.min(3, boostedStocks.length)
            for (let i = 0; i < boostCount; i++) {
                const boostStock = boostedStocks[currentSeed % boostedStocks.length]
                const idx = shuffled.indexOf(boostStock)
                if (idx > -1) {
                    shuffled.splice(idx, 1)
                    shuffled.unshift(boostStock)
                }
                currentSeed = (currentSeed * 1103515245 + 12345) % 2147483648
            }
        }

        for (let i = shuffled.length - 1; i > 0; i--) {
            currentSeed = (currentSeed * 9301 + 49297) % 233280
            const j = currentSeed % (i + 1)
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        return shuffled
    }

    const cosmicStocks = shuffleStocks(cosmicSeed)
    const numLucky = 2 + (parseInt(horoscopeData.lucky_number) % 4)
    const numUnlucky = 1 + (parseInt(horoscopeData.lucky_number) % 3)

    const up = cosmicStocks.slice(0, numLucky)
    const seventhHouseStart = Math.floor(cosmicStocks.length / 2)
    const down = cosmicStocks.slice(seventhHouseStart, seventhHouseStart + numUnlucky)

    return {
        up,
        down,
        method: 'hash-fallback',
        sectorMentions: null,
        sectorSentiments: null,
        explanation: `Based on your ${sign.element} element and cosmic alignment`
    }
}

// Hybrid approach: Try astrology first, fallback to hash
export const generateStockRecs = (horoscopeData, sign) => {
    // Try astrology-based selection first
    const astroResult = generateStockRecsFromHoroscope(horoscopeData, sign)

    // If we got stocks from astrology, use them
    if (astroResult.up.length > 0) {
        return astroResult
    }

    // Otherwise, fallback to hash-based
    return generateHashBasedRecs(horoscopeData, sign)
}
