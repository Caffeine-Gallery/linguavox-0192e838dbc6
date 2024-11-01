import Int "mo:base/Int";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
    // Store translation history
    private stable var translations : [(Text, Text, Text, Int)] = [];
    private let history = Buffer.Buffer<(Text, Text, Text, Int)>(0);

    // Initialize history from stable storage
    private func loadHistory() {
        for ((source, target, result, timestamp) in translations.vals()) {
            history.add((source, target, result, timestamp));
        };
    };

    system func preupgrade() {
        translations := Buffer.toArray(history);
    };

    system func postupgrade() {
        loadHistory();
    };

    // Add a translation to history
    public shared func addTranslation(source: Text, targetLang: Text, result: Text) : async () {
        history.add((source, targetLang, result, Time.now()));
    };

    // Get translation history
    public query func getHistory() : async [(Text, Text, Text, Int)] {
        Buffer.toArray(history)
    };
}
