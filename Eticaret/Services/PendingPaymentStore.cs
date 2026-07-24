using System.Collections.Concurrent;

namespace Eticaret.Services
{
    public class PendingPayment
    {
        public string UserId { get; set; } = null!;
        public string AddressId { get; set; } = null!;
    }

    public static class PendingPaymentStore
    {
        private static readonly ConcurrentDictionary<string, PendingPayment> _store = new();

        public static void Add(string conversationId, string userId, string addressId)
        {
            _store[conversationId] = new PendingPayment { UserId = userId, AddressId = addressId };
        }

        public static PendingPayment? Get(string conversationId)
        {
            if(string.IsNullOrEmpty(conversationId))
            {
                return null;
            }
            _store.TryGetValue(conversationId, out var value);
            return value;
        }

        public static void Remove(string conversationId)
        {
            _store.TryRemove(conversationId, out _);
        }
    }
}
