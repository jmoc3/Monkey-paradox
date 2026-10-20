package statistic

import (
	"context"

	"github.com/jmoc3/Social-Network.git/internal/domain/user"
)

type Repository interface {
	FindAll(ctx context.Context) ([]*StatisticWithUser, error)
	FindOne(ctx context.Context, id string) (*Statistic, error)
	FindByUser(ctx context.Context, userId string) ([]*Statistic, error)
	Save(ctx context.Context, statistic *Statistic) (string, error)
	Update(ctx context.Context, id string, statistic *Statistic) (string, error)
	Delete(ctx context.Context, id string) error
}

type StatisticWithUser struct {
	Statistic
	User user.UserBase `json:"user"`
}
