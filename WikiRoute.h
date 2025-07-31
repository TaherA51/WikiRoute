#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>

using namespace std;


class WikiRoute {
    unordered_set<string> sites;
    unordered_map<string, unordered_set<string>> adjList;

    // Keys will be of the form fromto e.g. "googlefacebook"
    unordered_map<string, int> weights;

    // For use in dijkstra, maybe dials too idk
    unordered_map<string, int> dist;


    public:
    // These might need to be changed, idk what the api output is exactly
    void addSite(string from);
    void addLink(string from, string to);

    // Set edge lengths to 1 or 2 depending on if the inverse edge exists
    void fixWeights();

    // Julian: I'll do dijkstra + some relevant helper functions (cant use libraries)
    // Helper functions for dijkstra
    string closest(string from, unordered_set<string>finished, unordered_map<string, int> dist);
    vector<string> recoverChain(string to, unordered_map<string, int> dist, unordered_map<string, string> parent);

    // Output is the chain from from to to
    vector<string> dijkstra(string from, string to);


    vector<string> dial(string from, string to);

};
