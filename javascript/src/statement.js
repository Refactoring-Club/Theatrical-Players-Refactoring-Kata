class Genre {
    constructor(
        baseCostForPerformance,
        minAudienceForAdditionalCost,
        fixedBonusForAudienceAboveThreshold,
        perTicketBonusForAudienceAboveThreshold,
        perTicketBonus
    ) {
        this.baseCostForPerformance = baseCostForPerformance;
        this.minAudienceForAdditionalCost = minAudienceForAdditionalCost;
        this.fixedBonusForAudienceAboveThreshold = fixedBonusForAudienceAboveThreshold;
        this.perTicketBonusForAudienceAboveThreshold = perTicketBonusForAudienceAboveThreshold;
        this.perTicketBonus = perTicketBonus;
    }
}

function calculateCostForTragedy(perf) {
    const genre = new Genre(40000, 30, 0, 1000, 0);
    return calculateCostForGenre(perf, genre);
}

function calculateCostForComedy(perf) {
    const genre = new Genre(30000, 20, 10000, 500, 300);
    return calculateCostForGenre(perf, genre);
}

function calculateCostForGenre(perf, genre) {
    let costForPerformance = genre.baseCostForPerformance;
    if (perf.audience > genre.minAudienceForAdditionalCost) {
        costForPerformance +=
            genre.fixedBonusForAudienceAboveThreshold +
            genre.perTicketBonusForAudienceAboveThreshold *
                (perf.audience - genre.minAudienceForAdditionalCost);
    }
    costForPerformance += genre.perTicketBonus * perf.audience;
    return costForPerformance;
}

function calculateVolumeCreditsForTragedy(perf) {
    return Math.max(perf.audience - 30, 0);
}

function calculateVolumeCreditsForComedy(perf) {
    let volumeCredits = 0;
    volumeCredits += Math.max(perf.audience - 30, 0);

    // add extra credit for every ten comedy attendees
    volumeCredits += Math.floor(perf.audience / 5);

    return volumeCredits;
}

const genreConfigurator = {
    tragedy: {
        cost: calculateCostForTragedy,
        volumeCredits: calculateVolumeCreditsForTragedy,
    },
    comedy: {
        cost: calculateCostForComedy,
        volumeCredits: calculateVolumeCreditsForComedy,
    },
};

function calculateCost(perf, type) {
    if (!genreConfigurator[type]) {
        throw new Error(`unknown type: ${type}`);
    }
    return genreConfigurator[type].cost(perf);
}

function calculateVolumeCredits(perf, play) {
    return genreConfigurator[play["type"]].volumeCredits(perf);
}

function statement(invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `Statement for ${invoice.customer}\n`;
    const format = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format;

    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        const costForPerformance = calculateCost(perf, play.type);
        volumeCredits += calculateVolumeCredits(perf, play);

        // print line for this order
        result += ` ${play.name}: ${format(costForPerformance / 100)} (${
            perf.audience
        } seats)\n`;
        totalAmount += costForPerformance;
    }
    result += `Amount owed is ${format(totalAmount / 100)}\n`;
    result += `You earned ${volumeCredits} credits\n`;
    return result;
}

module.exports = statement;
