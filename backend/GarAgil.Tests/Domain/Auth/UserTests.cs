using FluentAssertions;
using GarAgil.Domain.Auth;
using System;
using Xunit;

namespace GarAgil.Tests.Domain.Auth;

public class UserTests
{
    [Fact]
    public void Constructor_WithValidAdmin_ShouldBeApproved()
    {
        var user = new User("Admin User", "admin@test.com", "hash", "Admin");

        user.Status.Should().Be(UserStatus.Approved);
        user.Role.Should().Be("Admin");
    }

    [Fact]
    public void Constructor_WithValidMechanic_ShouldBePending()
    {
        var user = new User("Mechanic User", "mechanic@test.com", "hash", "Mechanic");

        user.Status.Should().Be(UserStatus.Pending);
        user.Role.Should().Be("Mechanic");
    }

    [Fact]
    public void Approve_WhenPending_ShouldChangeStatusToApproved()
    {
        var user = new User("Mechanic User", "mechanic@test.com", "hash", "Mechanic");
        
        user.Approve();

        user.Status.Should().Be(UserStatus.Approved);
    }

    [Fact]
    public void Reject_WhenPending_ShouldChangeStatusToRejected()
    {
        var user = new User("Mechanic User", "mechanic@test.com", "hash", "Mechanic");
        
        user.Reject();

        user.Status.Should().Be(UserStatus.Rejected);
    }

    [Theory]
    [InlineData("", "test@test.com", "hash", "Admin")]
    [InlineData("Name", "", "hash", "Admin")]
    [InlineData("Name", "test@test.com", "", "Admin")]
    [InlineData("Name", "test@test.com", "hash", "InvalidRole")]
    public void Constructor_WithInvalidData_ShouldThrowArgumentException(string name, string email, string hash, string role)
    {
        Action act = () => new User(name, email, hash, role);

        act.Should().Throw<ArgumentException>();
    }
}
