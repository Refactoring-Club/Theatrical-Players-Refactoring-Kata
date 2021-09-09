class CostCalculator {
    constructor(
        baseCostForPerformance,
        minAudienceForAdditionalCost,
        fixedBonusForAudienceAboveThreshold,
        perTicketBonusForAudienceAboveThreshold,
        perTicketBonus,
    ) {
        this.baseCostForPerformance = baseCostForPerformance;
        this.minAudienceForAdditionalCost = minAudienceForAdditionalCost;
        this.fixedBonusForAudienceAboveThreshold = fixedBonusForAudienceAboveThreshold;
        this.perTicketBonusForAudienceAboveThreshold = perTicketBonusForAudienceAboveThreshold;
        this.perTicketBonus = perTicketBonus;
    }

    calculate(perf) {
        let costForPerformance = this.baseCostForPerformance;
        if (perf.audience > this.minAudienceForAdditionalCost) {
            costForPerformance +=
                this.fixedBonusForAudienceAboveThreshold +
                this.perTicketBonusForAudienceAboveThreshold *
                (perf.audience - this.minAudienceForAdditionalCost);
        }
        costForPerformance += this.perTicketBonus * perf.audience;
        return costForPerformance;

    }
}

class VolumeCreditCalculator {
    constructor(
        audienceChunk = 0,
    ) {
        this.audienceChunk = audienceChunk;
    }

    calculate(perf) {
        let volumeCredits = 0;
        volumeCredits += Math.max(perf.audience - 30, 0);

        if (this.audienceChunk !== 0) {
            volumeCredits += Math.floor(perf.audience / this.audienceChunk);
        }

        return volumeCredits;
    }
}

class Genre {
    constructor(
        costCalculator,
        volumeCreditCalculator,
    ) {
        this.costCalculator = costCalculator;
        this.volumeCreditCalculator = volumeCreditCalculator;
    }
    cost(perf) {
        return this.costCalculator.calculate(perf)
    }
    volumeCredits(perf) {
        return this.volumeCreditCalculator.calculate(perf)
    }
}

class GenreFactory {
    static createFrom(genreType) {
        switch (genreType) {
            case 'comedy': {
                const costCalculator = new CostCalculator(30000, 20, 10000, 500, 300)
                const volumeCreditCalculator = new VolumeCreditCalculator(5)
                return new Genre(costCalculator, volumeCreditCalculator)
            }
            case 'tragedy': {
                const costCalculator = new CostCalculator(40000, 30, 0, 1000, 0)
                const volumeCreditCalculator = new VolumeCreditCalculator()
                return new Genre(costCalculator, volumeCreditCalculator)
            }
            default:
                throw new Error(`unknown type: ${genreType}`);
        }

    }
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

        const genre = GenreFactory.createFrom(play.type)
        const costForPerformance = genre.cost(perf)
        volumeCredits += genre.volumeCredits(perf)

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
