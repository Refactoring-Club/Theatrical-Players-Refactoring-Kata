
function calculateCost(perf, play) {
    let costForPerformance = 0;
    switch (play.type) {
        case "tragedy":
            costForPerformance = 40000;
            if (perf.audience > 30) {
                costForPerformance += 1000 * (perf.audience - 30);
            }
            break;
        case "comedy":
            costForPerformance = 30000;
            if (perf.audience > 20) {
                costForPerformance += 10000 + 500 * (perf.audience - 20);
            }
            costForPerformance += 300 * perf.audience;
            break;
        default:
            throw new Error(`unknown type: ${play.type}`);
    }
    return costForPerformance;
}
function statement (invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `Statement for ${invoice.customer}\n`;
    const format = new Intl.NumberFormat("en-US",
        { style: "currency", currency: "USD",
            minimumFractionDigits: 2 }).format;

    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        const costForPerformance = calculateCost(perf, play)
        
        // add volume credits
        volumeCredits += Math.max(perf.audience - 30, 0);
        // add extra credit for every ten comedy attendees
        if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);
        // print line for this order
        result += ` ${play.name}: ${format(costForPerformance/100)} (${perf.audience} seats)\n`;
        totalAmount += costForPerformance;
    }
    result += `Amount owed is ${format(totalAmount/100)}\n`;
    result += `You earned ${volumeCredits} credits\n`;
    return result;
}

module.exports = statement;
