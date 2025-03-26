const preSelectedDomains = [
    "rapyd.net",
    "timeclock365.com",
    "morphisec.com",
    "godaddy.com",
    "syncpal.co",
    "ibt.com.ro",
    "laufer.group",
    "adallom.com",
    "alphimax.com",
    "altnext.com",
    "argus-sec.com",
    "armis.com",
    "astrixsecurity.com",
    "audiocodes.com",
    "axis-security.com",
    "bizo.com",
    "bzigo.com",
    "cardscan.com",
    "checkpoint.com",
    "claroty.com",
    "cloudendure.com",
    "cloudinary.com",
    "commscope.com",
    "crosswise.com",
    "ctera.com",
    "ctslabs.com",
    "cyberark.com",
    "cyberbit.com",
    "cybereason.com",
    "cycognito.com",
    "cypago.com",
    "digsecurity.com",
    "explorium.ai",
    "entitle.co",
    "ezchip.com",
    "fireblocks.com",
    "forter.com",
    "fstbm.com",
    "gideononline.com",
    "gilat.com",
    "hubsecurity.com",
    "hunters.ai",
    "hyperwise.com",
    "icq.com",
    "ilventures.com",
    "imperva.com",
    "indeni.com",
    "infinidat.com",
    "infinipoint.com",
    "intsights.com",
    "ivix.com",
    "lacoon.com",
    "leadspace.com",
    "levltech.com",
    "noname.security",
    "namogoo.com",
    "nice.com",
    "nso-group.com",
    "onavo.com",
    "opster.com",
    "overops.com",
    "paloaltonetworks.com",
    "perimeterx.com",
    "primesense.com",
    "radware.com",
    "rosh-intelligent.com",
    "salt.security",
    "secdo.com",
    "silverfort.com",
    "solaredge.com",
    "viber.com",
    "votiro.com",
    "verint.com",
    "waze.com",
    "wing.security",
    "wix.com",
    "wiz.io",
    "xensource.com",
    "xiv.com",
    "yonatanlabs.com",
    "zoominfo.com"
];

// On installation, set up the pre-selected domains
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed or updated.");

    chrome.storage.local.get("blockedDomains", (data) => {
        let blockedDomains = data.blockedDomains || [];
        console.log("Existing blocked domains:", blockedDomains);

        // Add pre-selected domains only if they aren't already in storage
        preSelectedDomains.forEach((domain) => {
            if (!blockedDomains.includes(domain)) {
                blockedDomains.push(domain);
                console.log(`Added ${domain} to blocked domains.`);
            }
        });

        chrome.storage.local.set({ blockedDomains }, () => {
            console.log("Blocked domains updated in storage:", blockedDomains);
        });
    });
});

// Listen for storage changes (e.g., block/unblock)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.blockedDomains) {
        const updatedDomains = changes.blockedDomains.newValue || [];
        console.log("Storage changed, new blocked domains:", updatedDomains);
        updateBlockingRules(updatedDomains);
    }
});

// Function to update dynamic rules based on the blocked domains
function updateBlockingRules(domains) {
    console.log("Updating blocking rules for domains:", domains);

    const rules = domains.map((domain, index) => ({
        id: index + 1,
        priority: 1,
        action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
        condition: { urlFilter: `*://*.${domain}/*`, resourceTypes: ["main_frame"] }
    }));

    console.log("New rules to add:", rules);

    // Clear existing rules and apply the new ones
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules,
        removeRuleIds: rules.map((_, index) => index + 1) // Remove existing rules
    }, () => {
        console.log("Dynamic rules updated successfully.");
        
        // Fetch the current rules to check if they are applied
        chrome.declarativeNetRequest.getDynamicRules((currentRules) => {
            console.log("Current dynamic rules:", currentRules);
        });
    });
}

// Initial loading of the blocking rules from storage
chrome.storage.local.get("blockedDomains", (data) => {
    const blockedDomains = data.blockedDomains || [];
    console.log("Loaded blocked domains on startup:", blockedDomains);
    updateBlockingRules(blockedDomains);
});
