using System;

namespace GarAgil.Domain.Auth;

public enum UserStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

public class User
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public string Role { get; private set; } // "Admin" or "Mechanic"
    public UserStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }

#pragma warning disable CS8618
    private User() { }
#pragma warning restore CS8618

    public User(string name, string email, string passwordHash, string role)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email é obrigatório.");
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("Senha é obrigatória.");
        if (role != "Admin" && role != "Mechanic") throw new ArgumentException("Role inválida.");

        Id = Guid.NewGuid();
        Name = name;
        Email = email.ToLowerInvariant();
        PasswordHash = passwordHash;
        Role = role;
        
        // Admin is auto-approved for bootstrapping, Mechanics need approval
        Status = role == "Admin" ? UserStatus.Approved : UserStatus.Pending; 
        CreatedAt = DateTime.UtcNow;
    }

    public void Approve()
    {
        Status = UserStatus.Approved;
    }

    public void Reject()
    {
        Status = UserStatus.Rejected;
    }
}
