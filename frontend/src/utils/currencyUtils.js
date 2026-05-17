
export const formatToIndianCurrency = (num) => {
    if (!num) return "0";
    const x = num.toString().split('.')[0];
    const lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== "")
        return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    return lastThree; 
};

export const formatToShortIndianCurrency = (num) => {
    if (!num) return "0";
    if (num >= 10000000) {
        return (num / 10000000).toFixed(2) + " Cr";
    } else if (num >= 100000) {
        return (num / 100000).toFixed(2) + " Lakh";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + " K";
    }
    return num.toString();
};

export const toIndianWords = (num, lang = 'en') => {
    if (num === 0) return lang === 'hi' ? "शून्य" : "Zero";
    if (!num) return "";

    let n = Math.floor(num);
    let str = "";
    
    if (lang === 'hi') {
             const cr = Math.floor(n / 10000000);
             n -= cr * 10000000;
             const lk = Math.floor(n / 100000);
             n -= lk * 100000;
             const th = Math.floor(n / 1000);
             n -= th * 1000;
             const hn = Math.floor(n / 100);
             n -= hn * 100;
             const rest = n;
             
             if (cr > 0) str += cr + " करोड़ ";
             if (lk > 0) str += lk + " लाख ";
             if (th > 0) str += th + " हज़ार ";
             if (hn > 0) str += hn + " सौ ";
             if (rest > 0) str += rest;
             
             return str.trim();
    } else {
         const cro = Math.floor(n / 10000000);
         n -= cro * 10000000;
         const lak = Math.floor(n / 100000);
         n -= lak * 100000;
         const tho = Math.floor(n / 1000);
         n -= tho * 1000;
         const hun = Math.floor(n / 100);
         n -= hun * 100;
         const ten = n;
         
         if (cro > 0) str += cro + " Crore ";
         if (lak > 0) str += lak + " Lakh ";
         if (tho > 0) str += tho + " Thousand ";
         if (hun > 0) str += hun + " Hundred ";
         if (ten > 0) str += ten;
         
         return str.trim();
    }
};
